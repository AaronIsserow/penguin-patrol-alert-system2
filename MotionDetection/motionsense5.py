# --------------------------------------------------------------
# Imports
import cv2
import numpy as np
import time
import RPi.GPIO as GPIO
import pigpio
import math
from datetime import datetime, timedelta
from threading import Thread, Lock
from flask import Flask, Response
from flask_cors import CORS
from picamera2 import Picamera2
from supabase import create_client, Client
from dotenv import load_dotenv
import os

# --------------------------------------------------------------
# Load environment variables from .env file
load_dotenv()

# --------------------------------------------------------------
# Flask App Setup
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for frontend integration

# --------------------------------------------------------------
# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --------------------------------------------------------------
# Camera Setup
picam2 = Picamera2()
picam2.preview_configuration.main.size = (960, 540)  # Set resolution
picam2.preview_configuration.main.format = "RGB888"
picam2.preview_configuration.align()
picam2.configure("preview")
picam2.start()  # Start video stream

# --------------------------------------------------------------
# Servo Setup
PAN_GPIO = 12
TILT_GPIO = 13
PAN_MIN_ANGLE = -90
PAN_MAX_ANGLE = 90
PAN_OFFSET = 20
TILT_MIN_ANGLE = -30
TILT_MAX_ANGLE = 60
TILT_OFFSET = 20

pi = pigpio.pi()
if not pi.connected:
    raise RuntimeError("Cannot connect to pigpio daemon")

# Convert image center coordinates to servo angles
def pixel_to_angle(cx, cy, frame_w, frame_h):
    dx = cx - frame_w/2
    dy = cy - frame_h/2
    frac_x = dx / (frame_w / 2)
    frac_y = dy / (frame_h / 2)
    pan_angle = -frac_x * (FOV_X_DEG) + PAN_OFFSET
    tilt_angle = frac_y * (FOV_Y_DEG) + TILT_OFFSET
    pan_angle = max(PAN_MIN_ANGLE, min(PAN_MAX_ANGLE, pan_angle))
    tilt_angle = max(TILT_MIN_ANGLE, min(TILT_MAX_ANGLE, tilt_angle))
    return pan_angle, tilt_angle

# Convert angle to PWM pulse width for servo
def angle_to_pw(angle):
    angle = max(-90, min(90, angle))
    pulse = 1500 + (angle / 90.0) * 500
    return max(1000, min(2000, pulse))

# Move servos to target coordinates
def move_servos(cx, cy, frame_w, frame_h):
    pan_angle, tilt_angle = pixel_to_angle(cx, cy, frame_w, frame_h)
    pi.set_servo_pulsewidth(PAN_GPIO, angle_to_pw(pan_angle))
    pi.set_servo_pulsewidth(TILT_GPIO, angle_to_pw(tilt_angle))

# Reset servos and LED when shutting down
def shutdown_servos():
    pi.set_servo_pulsewidth(PAN_GPIO, 0)
    pi.set_servo_pulsewidth(TILT_GPIO, 0)
    pi.write(LED_PIN, 0)
    pi.stop()

# --------------------------------------------------------------
# LED GPIO Setup
LED_PIN = 26
pi.set_mode(LED_PIN, pigpio.OUTPUT)

# --------------------------------------------------------------
# Globals for Motion Detection
first_frame = None
temp_frame = None
stabilized_count = 0
required_stable_frames = 20
MOTION_THRESHOLD = 5000
lock = Lock()
FOV_X_DEG = 62.2 - 15  # Adjusted field of view
FOV_Y_DEG = 48.8
UPDATE_INTERVAL = 0.05
last_update_time = 0
latest_frame = None
frame_lock = Lock()

# --------------------------------------------------------------
# Supabase Logging
def log_motion_event():
    timestamp = datetime.now().isoformat()
    try:
        data = {
            "location": "Perimeter A",
            "time": timestamp,
            "action_taken": "Laser deployed",
            "acknowledged": False
        }
        supabase.table("detections").insert(data).execute()
        print(f"Motion logged to Supabase at {timestamp}")
    except Exception as e:
        print(f"Supabase logging failed: {e}")

# --------------------------------------------------------------
# Identify best contour above a pixel area threshold
def get_best_contour(imgmask, threshold):
    contours, _ = cv2.findContours(imgmask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    best_area = threshold
    best_cnt = None
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > best_area:
            best_area = area
            best_cnt = cnt
    return best_cnt

# --------------------------------------------------------------
# Reset background model for stabilization
def reset_stabilization():
    global first_frame, temp_frame, stabilized_count
    first_frame = None
    temp_frame = None
    stabilized_count = 0
    print("Recalibrating background frame...")

# --------------------------------------------------------------
# Main Motion Detection Loop (runs in thread)
def motion_detection_loop():
    global first_frame, temp_frame, stabilized_count, last_update_time, latest_frame
    motion_active = False
    last_alert_time = None
    print("Waiting for camera to stabilize...")

    recalibration_interval = timedelta(minutes=5)
    last_recalibration_time = datetime.utcnow()

    while True:
        now = datetime.utcnow()
        if now - last_recalibration_time >= recalibration_interval:
            reset_stabilization()
            last_recalibration_time = now

        # Capture frame
        frame = picam2.capture_array()
        gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)

        with lock:
            if first_frame is None:
                if temp_frame is None:
                    temp_frame = gray
                    continue
                delta = cv2.absdiff(temp_frame, gray)
                temp_frame = gray
                diff = cv2.threshold(delta, 10, 255, cv2.THRESH_BINARY)[1]
                diff = cv2.dilate(diff, None, iterations=2)
                motion_pixels = cv2.countNonZero(diff)

                if motion_pixels < 300:
                    stabilized_count += 1
                    if stabilized_count >= required_stable_frames:
                        first_frame = gray
                        print("Stabilized. Motion detection activated.")
                        continue
                else:
                    stabilized_count = 0
                continue

            # Compare current frame to background
            delta = cv2.absdiff(first_frame, gray)
            thresh = cv2.threshold(delta, 30, 255, cv2.THRESH_BINARY)[1]
            thresh = cv2.dilate(thresh, None, iterations=2)

            best_contour = get_best_contour(thresh.copy(), threshold=MOTION_THRESHOLD)

            if best_contour is not None:
                (x, y, w, h) = cv2.boundingRect(best_contour)
                frame_h, frame_w = frame.shape[:2]
                cx, cy = x + w // 2, y + h // 2

                move_servos(cx, cy, frame_w, frame_h)
                pi.write(LED_PIN, 1)  # Turn on LED to indicate motion

                # Draw detection box
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(frame, "Motion Detected", (10, 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

                now = datetime.utcnow()
                if not motion_active:
                    motion_active = True
                    last_alert_time = now
                    log_motion_event()
                    print("Motion started, alert sent.")
                elif (now - last_alert_time).total_seconds() >= 60:
                    log_motion_event()
                    last_alert_time = now
                    print("Motion ongoing, secondary alert sent")
            else:
                pi.write(LED_PIN, 0)  # Turn off LED
                if motion_active:
                    print("Motion stopped")
                    motion_active = False
                    last_alert_time = None

        # Encode frame for live video streaming
        ret, jpeg = cv2.imencode('.jpg', frame)
        if ret:
            with frame_lock:
                latest_frame = jpeg.tobytes()

# --------------------------------------------------------------
# Flask Route: /video_feed returns MJPEG stream
@app.route('/video_feed')
def video_feed():
    def frame_generator():
        while True:
            with frame_lock:
                frame = latest_frame
            if frame:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            time.sleep(0.05)
    return Response(frame_generator(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# --------------------------------------------------------------
# Cleanup GPIO on shutdown
import atexit
atexit.register(shutdown_servos)

# --------------------------------------------------------------
# Start Flask App and motion detection loop
if __name__ == '__main__':
    Thread(target=motion_detection_loop, daemon=True).start()
    app.run(host='0.0.0.0', port=5000, threaded=True)


# --------------------------------------------------------------
# Flask Video Feed Route

@app.route('/video_feed')
def video_feed():
    def frame_generator():
        while True:
            with frame_lock:
                frame = latest_frame
            if frame:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            time.sleep(0.05)
    return Response(frame_generator(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# --------------------------------------------------------------
# Cleanup servos and GPIO on exit

import atexit
atexit.register(shutdown_servos)

# --------------------------------------------------------------
# Run Flask App

if __name__ == '__main__':
    Thread(target=motion_detection_loop, daemon=True).start()
    app.run(host='0.0.0.0', port=5000, threaded=True)

