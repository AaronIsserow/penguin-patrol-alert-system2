# 🛰️ Motion Detection Subsystem — Turret Project

This folder contains the motion detection and control logic used in the automated turret project. It combines lightweight computer vision, real-time hardware actuation, and cloud-based logging to detect and track movement within a camera's field of view.

---

## 📚 Background

### 📷 Motion Detection Overview (Using OpenCV)

The system uses **frame differencing**, a classic motion detection technique, where each incoming frame is compared against a stabilized background. The open source image processing library OpenCV handles the following steps:

- **Frame capture** from the Pi Camera.
- **Grayscale conversion** and **Gaussian blur** to reduce noise.
- **Absolute difference** between the current frame and a reference background.
- **Thresholding** and **morphological operations** to isolate moving regions.
- **Contour detection** to identify the largest significant object.

If the detected contour exceeds a pixel area threshold, it's considered significant motion. The center of the bounding box is calculated and used to point the turret in that direction.

> This method is fast and lightweight, ideal for low-power hardware, but is sensitive to lighting changes and assumes a mostly static background.

---

### 🧰 Hardware Architecture

| Component             | Role                                                                 |
|-----------------------|----------------------------------------------------------------------|
| Raspberry Pi 3B+      | Main processing unit, runs detection and Flask server.               |
| Pi Camera V2 NoIR     | Captures frames for processing, with infrared sensitivity for low-light. |
| Servo Motors (x2)     | Controlled via PWM to adjust turret pan and tilt.                   |
| IR LED Module (opt.)  | Recommended for improving night detection performance.              |

---

## 📁 Folder Contents

| File                | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| `motionsense5.py`   | Captures video, detects motion, controls servos, logs to Supabase, and streams annotated video. |
| `flask_controller.py` | Flask server exposing `/start`, `/stop`, and `/status` endpoints, also updates system status in Supabase. |

---

## ⚙️ motionsense5.py — Motion Detection Engine

- Initializes camera and background model.
- Detects motion using image differencing + contour filtering.
- Translates motion coordinates to servo angles using a calibrated FOV.
- Controls pan and tilt servos via `pigpio`.
- Logs each detection to a Supabase table with timestamp and location.
- Streams live video with bounding box overlays via a `/video_feed` endpoint.

---

## 🌐 flask_controller.py — Remote API Interface

A lightweight Flask server for remote subsystem control:

**Endpoints:**
- `POST /start` — Launches `motionsense5.py`.
- `POST /stop` — Terminates detection and resets servos.
- `GET /status` — Returns whether detection is active.

It also sets the `status` field in Supabase's `perimeters` table to reflect system state (boot, shutdown, and manual control).

---

## 🔐 Environment Variables

Create a `.env` file:

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
