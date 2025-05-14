import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera } from "lucide-react";

const CAMERA_URL = "http://192.168.0.214:5000/video_feed"; // Use your Pi's actual IP
const CONTROLLER_URL = "http://192.168.0.214:8000"; // Use your Pi's actual IP

const CameraFeed: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2">
          <Camera className="h-4 w-4" />
          View Live Camera
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Live Camera Feed</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video w-full bg-muted flex items-center justify-center">
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

const PiControl: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setError(null);
      const res = await fetch(`${CONTROLLER_URL}/status`);
      if (!res.ok) throw new Error("Failed to fetch status");
      const data = await res.json();
      setIsRunning(data.running);
    } catch {
      setIsRunning(null);
      setError("Unable to reach Pi controller.");
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    setError(null);
    const endpoint = isRunning ? "stop" : "start";
    try {
      const res = await fetch(`${CONTROLLER_URL}/${endpoint}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to send command");
      const data = await res.json();
      setStatus(data.status);
      fetchStatus();
    } catch {
      setError("Failed to send command to Pi.");
    }
  };

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
      {status && <div className="text-sm mt-2">Status: {status}</div>}
      {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default CameraFeed;
export { PiControl };
