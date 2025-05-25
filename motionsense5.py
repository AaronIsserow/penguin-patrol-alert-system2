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
# Flask App Setup

app = Flask(__name__)
CORS(app)

# --------------------------------------------------------------
# Supabase Configuration

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --------------------------------------------------------------
# Camera Setup
picam2 = Picamera2()
picam2.preview_configuration.main.size = (960, 540)
picam2.preview_configuration.main.format = "RGB888"
picam2.preview_configuration.align()
picam2.configure("preview")
picam2.start()

# --------------------------------------------------------------
# Servo Setup

PAN_GPIO = 12   # GPIO pin for pan servo
TILT_GPIO = 13  # GPIO pin for tilt servo
PAN_MIN_ANGLE = -90
PAN_MAX_ANGLE = 90
PAN_OFFSET = 20
TILT_MIN_ANGLE = -30
TILT_MAX_ANGLE = 60
TILT_OFFSET = 20

pi = pigpio.pi()
if not pi.connected:
    raise RuntimeError("Cannot connect to pigpio daemon")

def pixel_to_angle(cx, cy, frame_w, frame_h):
    # Convert pixel coordinates to angles
    dx = cx - frame_w/2
    dy = cy - frame_h/2
    # Normalize to -1 to 1 range
    frac_x = dx/(frame_w/2)
    frac_y = dy/(frame_h/2)
    # Calculate angles based on FOV
    pan_angle = -frac_x * (FOV_X_DEG)
    pan_angle += PAN_OFFSET
    tilt_angle = frac_y * (FOV_Y_DEG)
    tilt_angle += TILT_OFFSET
    # Clamp angles to servo limits
    pan_angle = max(PAN_MIN_ANGLE, min(PAN_MAX_ANGLE, pan_angle))
    tilt_angle = max(TILT_MIN_ANGLE, min(TILT_MAX_ANGLE, tilt_angle))

    return pan_angle, tilt_angle

def angle_to_pw(angle):
    angle = max(-90, min(90, angle))
    pulse = 1500 + (angle / 90.0) * 500
    pulse = max(1000, min(2000, pulse))
    return pulse

def move_servos(cx, cy, frame_w, frame_h):
    pan_angle, tilt_angle = pixel_to_angle(cx, cy, frame_w, frame_h)
    # pan_angle += (pan_angle)
    pi.set_servo_pulsewidth(PAN_GPIO, angle_to_pw(pan_angle))
    pi.set_servo_pulsewidth(TILT_GPIO, angle_to_pw(tilt_angle))

def shutdown_servos():
    pi.set_servo_pulsewidth(PAN_GPIO,0)
    pi.set_servo_pulsewidth(TILT_GPIO,0)
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
FOV_X_DEG = 62.2 - 15
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
# Get Best Contour

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
# Reset Stabilization

def reset_stabilization():
    global first_frame, temp_frame, stabilized_count
    first_frame = None
    temp_frame = None
    stabilized_count = 0
    print("Recalibrating background frame...")

# --------------------------------------------------------------
# Video Frame Generator for Flask

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

        frame = picam2.capture_array()
        gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)

        with lock:
            if first_frame is None:
                if temp_frame is None:
                    temp_frame = gray
                    continue
                else:
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

            # Motion detection
            delta = cv2.absdiff(first_frame, gray)
            thresh = cv2.threshold(delta, 30, 255, cv2.THRESH_BINARY)[1]
            thresh = cv2.dilate(thresh, None, iterations=2)

            best_contour = get_best_contour(thresh.copy(), threshold=MOTION_THRESHOLD)

            if best_contour is not None:
                (x, y, w, h) = cv2.boundingRect(best_contour)
                # Get center of bounding box
                frame_h, frame_w = frame.shape[:2]
                cx, cy = x + w // 2, y + h // 2

                move_servos(cx,cy,frame_w,frame_h)

                pi.write(LED_PIN, 1)

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
                pi.write(LED_PIN, 0)
                if motion_active:
                    print("Motion stopped")
                    motion_active = False
                    last_alert_time = None

        # Store the frame for streaming
        ret, jpeg = cv2.imencode('.jpg', frame)
        if ret:
            with frame_lock:
                latest_frame = jpeg.tobytes()

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

