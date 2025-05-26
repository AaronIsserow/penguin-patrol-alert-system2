# 🐧 Penguin Patrol Alert System

## Table of Contents

- [Project Overview](#project-overview)  
- [Key Features](#key-features)  
- [Architecture & Tech Stack](#architecture--tech-stack)  
- [Mechanical Design & 3D Printing](#mechanical-design--3d-printing)
- [Motion Detection](#motion-detection)
- [Installation & Setup](#installation--setup)

---

## Project Overview

**Penguin Patrol Alert System** is a full-stack web application developed for **EEE4113F** at the University of Cape Town. It integrates real-time predator detection (via computer vision and a Raspberry Pi NoIR camera) with a two-axis pan–tilt gimbal and non-lethal deterrent actuation. Alerts are stored and displayed through a user-friendly dashboard, ensuring rapid intervention to protect the De Hoop penguin colony.

---


## Key Features

- 🎥 **Live Video Streaming** with motion-detection overlays  
- 🔴 **Real-Time Alerts** stored in Supabase and pushed via WebSockets  
- 🛰️ **Pan–Tilt Gimbal Control** for ±90° tracking accuracy  
- 💧 **Non-Lethal Deterrent** (configurable water-jet or laser)  
- 📊 **Dashboard & Analytics** with CSV export  
- 🔧 **Modular Mechanical Design** with 3D-printed submodules

### Basic Example Operation

![systemuse (2)](https://github.com/user-attachments/assets/1eb72516-5ab7-4643-8b90-9a9de7d6000d)

---

## Architecture & Tech Stack

| Layer               | Technology                         |
|---------------------|------------------------------------|
| **Frontend**        | React, Tailwind CSS       |
| **Backend / API**   | Node.js, Supabase (PostgreSQL)     |
| **Realtime Comm.**  | Supabase Realtime      |
| **Vision & Control**| Python, OpenCV, pigpio, Raspberry Pi OS |
| **3D Modeling**     | Fusion 360 (CAD)                   |
| **3D Printing**     | Cura / PrusaSlicer                 |

---

## Mechanical Design & 3D Printing

Detailed mechanical design ensures precise servo alignment, environmental sealing, and easy assembly. All parts were 3D-printed and validated with FEA before prototyping.

![Linking v2](https://github.com/user-attachments/assets/4f3c1a33-e654-4a75-ad1e-5428e2d53cee)

## Assembly

![Linking v1](https://github.com/user-attachments/assets/3185dab7-32ed-4a40-9421-f90bf5f59b8d)

### Printed Components

| Part              | Description                            | Qty |
|-------------------|----------------------------------------|:---:|
| **Pan Module**    | Base plate with servo pocket & mounts  |  1  |
| **Tilt Module**   | Horizontal servo carrier & gussets     |  1  |
| **Enclosure Base**| IP66-ready housing (bottom half)       |  1  |
| **Enclosure Lid** | Snap-fit top cover with gasket groove  |  1  |
| **Fence Clip**    | Modular mount for fence attachment     |  1  |

<p align="center">
  <img src="docs/prints_grid.jpg" alt="3D Printed Parts" width="80%"/>
</p>

### Materials & Settings

- **Filament:**  
  - **UV-stable ASA** for outdoor parts  
  - **PLA+** for enclosure prototypes  
- **Printer:** Creality CR-10 / Prusa i3 MK3S+  
- **Layer Height:** 0.2 mm, **Infill:** 20 %, **Walls:** 3 perimeters  
- **Nozzle Temp:** 240 °C (ASA) / 210 °C (PLA+),  
  **Bed Temp:** 100 °C (ASA) / 60 °C (PLA+)

### CAD & STL Files

All source and exported STLs live in the `MechanicalDesign/` folder:
design/
├─ pan_module.f3d pan_module.stl
├─ tilt_module.f3d tilt_module.stl
├─ enclosure_base.f3d enclosure_base.stl
└─ enclosure_lid.f3d enclosure_lid.stl

## Motion Detection

The Penguin Patrol Alert System employs an advanced real-time motion detection algorithm running on a Raspberry Pi with a NoIR camera module. This enables reliable predator detection even under challenging lighting conditions.

- **Algorithm Overview:**  
  - The system captures continuous frames from the NoIR camera and applies frame differencing to highlight regions of change between consecutive images.  
  - To reduce noise and false positives caused by environmental factors (e.g., shadows, lighting changes), a Gaussian blur filter is applied before differencing.  
  - The resulting difference image is thresholded to create a binary mask representing motion regions.  
  - Contours are extracted from this binary mask and filtered based on area and shape criteria to isolate valid moving objects.  
  - Temporal filtering tracks object persistence over multiple frames to avoid transient false detections.  
- **Hardware:** Raspberry Pi Camera Module V2 NoIR is used for its enhanced infrared sensitivity, combined with optional IR LED illumination for night-time detection.  
- **Control Integration:** Upon detection, the Python-based control script commands the pan–tilt gimbal servos via GPIO using pigpio, allowing smooth tracking of detected objects within ±90° range.  
- **Alerting:** Simultaneously, detection events are logged and pushed in real-time to the Supabase backend, enabling live notifications and historical analytics through the web dashboard.  
- **Configuration:** Parameters such as blur kernel size, threshold values, minimum contour area, and tracking persistence are adjustable in the `motionsense.py` file to optimize system performance under varying environmental conditions.

This comprehensive detection pipeline balances sensitivity with robustness, ensuring reliable predator tracking while minimizing false alarms to protect the penguin colony effectively.


## Installation & Setup

1. **Clone the repository**  
   ```bash
   git clone https://github.com/AaronIsserow/penguin-patrol-alert-system2.git

2. **Install Dependencies**
  npm install                  # Frontend & API
3. Create a .env file in the root directory with your API keys:
  - OpenAI API key for chatbot
  - Supabase credentials
4. Start the development server:
    npm run dev
