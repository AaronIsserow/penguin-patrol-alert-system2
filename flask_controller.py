#!/usr/bin/env python3
from flask import Flask, jsonify, request
import subprocess
from flask_cors import CORS
from supabase import create_client, Client
import atexit

SUPABASE_URL = "https://ngmqdttrndpkuppywohg.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbXFkdHRybmRwa3VwcHl3b2hnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDE5ODMyMiwiZXhwIjoyMDU5Nzc0MzIyfQ.rCz23RQxZvN93pZUBEUgxqi3na2pwYCULSTdGdJMZpU"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)
CORS(app)
proc = None  # Holds the subprocess running motionsense5.py

try:
    supabase.table("perimeters").update({"status": True}).eq("zone", "A").execute()
    print("Supabase perimeter A set to active (True) at boot.")
except Exception as e:
    print(f"Failed to update perimeter status on boot: {e}")

@app.route('/start', methods=['POST'])
def start_script():
    global proc
    if proc is None or proc.poll() is not None:
        proc = subprocess.Popen(['/home/pi/MotionSenseCode/motionsense/bin/python', '/home/pi/MotionSenseCode/motionsense5.py'])
        return jsonify({'status': 'started'})
    else:
        return jsonify({'status': 'already running'})

@app.route('/stop', methods=['POST'])
def stop_script():
    global proc
    if proc and proc.poll() is None:
        proc.terminate()
        proc = None
        return jsonify({'status': 'stopped'})
    else:
        return jsonify({'status': 'not running'})

@app.route('/status', methods=['GET'])
def status():
   global proc
   if proc and proc.poll() is None:
     return jsonify({'running': True})
   else:
     return jsonify({'running': False})

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

atexit.register(cleanup)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)