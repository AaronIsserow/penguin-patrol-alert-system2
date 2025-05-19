// DetectionModal: Real-time alert dialog for new detections
import React, { useEffect, useRef } from "react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Detection } from "@/types/detection";
import { acknowledgeDetection, acknowledgeAllDetections } from "@/services/detectionService";
import { useAuth } from "@/context/AuthContext";

interface DetectionModalProps {
  detection: Detection;
  onClose: () => void;
  onAcknowledged: () => void;
}

const DetectionModal: React.FC<DetectionModalProps> = ({ 
  detection, 
  onClose,
  onAcknowledged
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  // Ref for alarm sound
  const audioRef = useRef<HTMLAudioElement | null>(
    typeof Audio !== 'undefined' ? new Audio('/alarm.mp3') : null
  );
  const { isAdmin, isFieldAgent } = useAuth();

  // Play alarm sound on open, stop on close
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error("Error playing alarm sound:", error);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Handle alert acknowledgment and stop alarm
  const handleAcknowledge = async () => {
    if (detection.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      await acknowledgeDetection(detection.id);
      onAcknowledged();
    }
  };

  // Handle acknowledge all
  const handleAcknowledgeAll = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    await acknowledgeAllDetections();
    onAcknowledged();
  };

  // Stop alarm and open live camera feed
  const handleViewLiveCamera = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onClose();
    setTimeout(() => {
      window.dispatchEvent(new Event('open-camera-dialog'));
    }, 100);
  };

  // Only admins/field agents can acknowledge
  const canAcknowledge = isAdmin || isFieldAgent;

  // Render alert dialog with details and actions
  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-6 w-6" />
            <AlertDialogTitle>Honey Badger Detected!</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-2 py-4">
            <p className="font-medium">
              A honey badger has been detected in <span className="font-bold">{detection.location}</span> at {new Date(detection.time).toLocaleString()}
            </p>
            <div className="bg-muted p-3 mt-2 rounded-md">
              <p className="font-medium">Action taken: {detection.action_taken}</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-wrap gap-2 justify-center">
          <AlertDialogCancel ref={cancelRef} asChild>
            <Button variant="outline" onClick={onClose} size="sm" className="w-auto min-w-0">
              Close
            </Button>
          </AlertDialogCancel>
          {canAcknowledge && (
            <>
              <AlertDialogAction ref={actionRef} asChild>
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 w-auto min-w-0"
                  onClick={handleAcknowledge}
                  size="sm"
                >
                  Acknowledge Alert
                </Button>
              </AlertDialogAction>
              <AlertDialogAction asChild>
                <Button
                  variant="outline"
                  onClick={handleAcknowledgeAll}
                  size="sm"
                  className="w-auto min-w-0"
                >
                  Acknowledge All
                </Button>
              </AlertDialogAction>
            </>
          )}
          <AlertDialogAction asChild>
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 w-auto min-w-0"
              onClick={handleViewLiveCamera}
              size="sm"
            >
              View Live Camera
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DetectionModal;
