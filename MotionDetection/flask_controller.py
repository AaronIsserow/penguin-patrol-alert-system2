#!/usr/bin/env python3

# --------------------------------------------------------------
# Imports
from flask import Flask, jsonify, request
import subprocess
from flask_cors import CORS
from supabase import create_client, Client
import atexit
from dotenv import load_dotenv
import os

# --------------------------------------------------------------
# Load environment variables from .env file
load_dotenv()

# --------------------------------------------------------------
# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --------------------------------------------------------------
# Flask App Setup
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests (for frontend communication)
proc = None  # Global variable to hold reference to the subprocess

# --------------------------------------------------------------
# On boot: set system status to active in Supabase
try:
    supabase.table("perimeters").update({"status": True}).eq("zone", "A").execute()
    print("Supabase perimeter A set to active (True) at boot.")
except Exception as e:
    print(f"Failed to update perimeter status on boot: {e}")

# --------------------------------------------------------------
# Flask Route: Start the motion detection script
@app.route('/start', methods=['POST'])
def start_script():
    global proc
    if proc is None or proc.poll() is not None:
        # Start the Python script as a subprocess
        proc = subprocess.Popen([
            '/home/pi/MotionSenseCode/motionsense/bin/python',
            '/home/pi/MotionSenseCode/motionsense5.py'
        ])
        return jsonify({'status': 'started'})
    else:
        return jsonify({'status': 'already running'})

# --------------------------------------------------------------
# Flask Route: Stop the motion detection script
@app.route('/stop', methods=['POST'])
def stop_script():
    global proc
    if proc and proc.poll() is None:
        proc.terminate()  # Terminate the running script
        proc = None
        return jsonify({'status': 'stopped'})
    else:
        return jsonify({'status': 'not running'})

# --------------------------------------------------------------
# Flask Route: Return system status
@app.route('/status', methods=['GET'])
def status():
    global proc
    if proc and proc.poll() is None:
        return jsonify({'running': True})
    else:
        return jsonify({'running': False})

# --------------------------------------------------------------
# Cleanup: On shutdown, update Supabase status to inactive
def cleanup():
    try:
        response = supabase.table("perimeters").update({"status": False}).eq("zone", "A").execute()
        print("Supabase response:", response)
        if hasattr(response, 'error') and response.error:
            print("Supabase error:", response.error)
        else:
            print("Supabase perimeter A set to inactive (False) on shutdown.")
    except Exception as e:
        print(f"Failed to update perimeter status on shutdown: {e}")

# Register the cleanup function to be called on program exit
atexit.register(cleanup)

# --------------------------------------------------------------
# Run Flask server on startup
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)  # Listen on all interfaces, port 8000
