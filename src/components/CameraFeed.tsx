// CameraFeed: Shows live video stream from the camera in a dialog
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera } from "lucide-react";
import { usePerimeterStatus } from "@/hooks/usePerimeterStatus";

const CAMERA_URL = "http://192.168.35.21:5000/video_feed"; // Use your Pi's actual IP
const CONTROLLER_URL = "http://192.168.35.21:8000"; // Use your Pi's actual IP

// Main camera feed component
const CameraFeed: React.FC<{ cameraDisabled?: boolean }> = ({ cameraDisabled = false }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Listen for custom event to open the camera dialog
  useEffect(() => {
    const openCamera = () => setIsDialogOpen(true);
    window.addEventListener('open-camera-dialog', openCamera);
    return () => window.removeEventListener('open-camera-dialog', openCamera);
  }, []);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2" disabled={cameraDisabled}>
          <Camera className="h-4 w-4" />
          View Live Camera
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Live Camera Feed</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video w-full bg-muted flex items-center justify-center">
          {/* Live video stream from camera */}
          <img
            src={CAMERA_URL}
            alt="Live Camera Feed"
            style={{ width: "100%", borderRadius: "8px", background: "#000" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// PiControl: Controls for starting/stopping the camera/detector
const PiControl: React.FC<{ onCountdownChange?: (countingDown: boolean) => void }> = ({ onCountdownChange }) => {
  const [isRunning, setIsRunning] = useState<boolean | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { updatePerimeterStatus } = usePerimeterStatus();
  const [loadingBarActive, setLoadingBarActive] = useState(false);
  const [loadingBarPercent, setLoadingBarPercent] = useState(0);
  const loadingBarDuration = 10000; // 10 seconds
  const loadingBarInterval = 100; // ms
  const loadingBarSteps = loadingBarDuration / loadingBarInterval;

  // Fetch camera/detector status from backend
  const fetchStatus = async () => {
    try {
      setError(null);
      const res = await fetch(`${CONTROLLER_URL}/status`);
      if (!res.ok) throw new Error("Failed to fetch status");
      const data = await res.json();
      setIsRunning(data.running);
      // Set Perimeter A to true if Pi is reachable
      updatePerimeterStatus('A', true);
    } catch {
      setIsRunning(null);
      setError("Unable to reach Pi controller.");
      // Set Perimeter A to false if Pi is not reachable
      updatePerimeterStatus('A', false);
    }
  };

  // Poll status every 3 seconds
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  // Handle start/stop button click
  const handleToggle = async () => {
    setError(null);
    const endpoint = isRunning ? "stop" : "start";
    try {
      const res = await fetch(`${CONTROLLER_URL}/${endpoint}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to send command");
      const data = await res.json();
      setStatus(data.status);
      fetchStatus();
      // If starting, begin loading bar
      if (!isRunning) {
        setLoadingBarActive(true);
        setLoadingBarPercent(0);
        if (onCountdownChange) onCountdownChange(true);
      }
    } catch {
      setError("Failed to send command to Pi.");
    }
  };

  // Loading bar effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (loadingBarActive) {
      let progress = 0;
      interval = setInterval(() => {
        progress++;
        setLoadingBarPercent((progress / loadingBarSteps) * 100);
        if (progress >= loadingBarSteps) {
          setLoadingBarActive(false);
          setLoadingBarPercent(100);
          if (onCountdownChange) onCountdownChange(false);
          if (interval) clearInterval(interval);
        }
      }, loadingBarInterval);
    } else {
      setLoadingBarPercent(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadingBarActive, onCountdownChange]);

  return (
    <div className="flex flex-col gap-2 my-4">
      <Button
        onClick={handleToggle}
        variant={isRunning ? "destructive" : "default"}
        disabled={isRunning === null}
      >
        {isRunning === null
          ? "Checking status..."
          : isRunning
          ? "Stop Camera/Detection"
          : "Start Camera/Detection"}
      </Button>
      {loadingBarActive && (
        <div className="w-full mt-2">
          <div className="text-sm text-yellow-600 mb-1">System starting, please wait...</div>
          <div className="w-full h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-yellow-500 rounded transition-all duration-100"
              style={{ width: `${loadingBarPercent}%` }}
            ></div>
          </div>
        </div>
      )}
      {!loadingBarActive && status && <div className="text-sm mt-2">Status: {status}</div>}
      {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default CameraFeed;
export { PiControl };
