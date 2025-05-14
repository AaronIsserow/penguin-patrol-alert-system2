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
import { acknowledgeDetection } from "@/services/detectionService";
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
  const audioRef = useRef<HTMLAudioElement | null>(
    typeof Audio !== 'undefined' ? new Audio('/alarm.mp3') : null
  );
  const { isAdmin, isFieldAgent } = useAuth();

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

  const handleAcknowledge = async () => {
    if (detection.id) {
      // Stop the alarm sound
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      await acknowledgeDetection(detection.id);
      onAcknowledged();
    }
  };

  const handleViewLiveFeed = () => {
    // Stop the alarm sound when viewing live feed
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Close the modal
    onClose();
    
    // After a short delay, find and click the camera button
    setTimeout(() => {
      const cameraButtons = document.querySelectorAll('button');
      for (const button of cameraButtons) {
        if (button.textContent?.includes('View Live Camera')) {
          button.click();
          break;
        }
      }
    }, 100);
  };

  // Determine if user can acknowledge alerts
  const canAcknowledge = isAdmin || isFieldAgent;

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
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
          <AlertDialogCancel ref={cancelRef} asChild>
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
          </AlertDialogCancel>
          
          {canAcknowledge && (
            <AlertDialogAction ref={actionRef} asChild>
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" 
                onClick={handleAcknowledge}
              >
                Acknowledge Alert
              </Button>
            </AlertDialogAction>
          )}
          
          <AlertDialogAction asChild>
            <Button 
              variant="default" 
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              onClick={handleViewLiveFeed}
            >
              View Live Feed
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DetectionModal;
