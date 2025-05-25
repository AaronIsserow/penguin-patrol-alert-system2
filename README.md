# Penguin Patrol Alert System

## Project Overview
A web application for managing and monitoring penguin patrol alerts. This project was developed as part of the EEE4113F course at the University of Cape Town.

## Team Members
- Aaron Isserow, Emanuele Vichi and Ethan Faraday

## Project Goals
- Create a user-friendly interface for monitoring a penguin colony.
- Implement a real-time alert system for preditor detections.

## How to Run

1. Install dependencies:

npm install


2. Create a `.env` file in the root directory with your API keys:
- OpenAI API key for chatbot
- Supabase credentials


3. Start the development server:

npm run dev
# 🐧 Penguin Patrol Alert System

## Table of Contents

- [Project Overview](#project-overview)  
- [Key Features](#key-features)  
- [Architecture & Tech Stack](#architecture--tech-stack)  
- [Mechanical Design & 3D Printing](#mechanical-design--3d-printing)  
- [Installation & Setup](#installation--setup)  
- [Running the App](#running-the-app)  
- [Demo Videos](#demo-videos)  
- [Usage](#usage)  
- [Contributing](#contributing)  


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

---

## Architecture & Tech Stack

| Layer               | Technology                         |
|---------------------|------------------------------------|
| **Frontend**        | Next.js, React, Tailwind CSS       |
| **Backend / API**   | Node.js, Supabase (PostgreSQL)     |
| **Realtime Comm.**  | Supabase Realtime, WebSockets      |
| **Vision & Control**| Python, OpenCV, pigpio, Raspberry Pi OS |
| **3D Modeling**     | Fusion 360 (CAD)                   |
| **3D Printing**     | Cura / PrusaSlicer                 |

---

## Mechanical Design & 3D Printing

Detailed mechanical design ensures precise servo alignment, environmental sealing, and easy assembly. All parts were 3D-printed and validated with FEA before prototyping.

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

