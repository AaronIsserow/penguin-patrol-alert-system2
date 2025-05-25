# 🛰️ Motion Detection Subsystem — Turret Project

This folder contains the core motion detection and control scripts for the automated turret system. It includes a background-subtraction-based detection pipeline, integrated servo control for actuation, and a Flask-based backend interface for remote control and monitoring.

---

## 📁 Folder Contents

| File                | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| `motionsense5.py`   | Main motion detection script. Captures video, detects motion, controls servos, logs to Supabase, and streams live feed. |
| `flask_controller.py` | Flask server exposing endpoints to start/stop motion detection and update Supabase system status. |
| `.env`              | Contains Supabase credentials (not committed to version control).           |

---

## ⚙️ motionsense5.py — Motion Detection Engine

- Captures frames from the Pi Camera using `picamera2`.
- Detects motion via background differencing and contour detection.
- Controls servo motors (pan & tilt) using `pigpio` to track motion.
- Logs motion events to a Supabase table (`detections`).
- Streams annotated video via the `/video_feed` endpoint.

This script is run as a subprocess by the Flask controller.

---

## 🌐 flask_controller.py — Remote API Interface

A minimal Flask app for remote management of the motion subsystem.

**Available Endpoints:**
- `POST /start` — Starts the `motionsense5.py` script.
- `POST /stop` — Stops the detection script and shuts down servos.
- `GET /status` — Returns whether detection is currently active.

Automatically updates Supabase's `perimeters` table at startup and shutdown.

---

## 🔐 Environment Variables

Create a `.env` file in the root of the folder:

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-secret-api-key
