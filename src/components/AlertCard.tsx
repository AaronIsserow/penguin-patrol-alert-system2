// AlertCard: Displays details for a single detection alert
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check } from "lucide-react";
import { Detection } from "@/types/detection";
import { acknowledgeDetection } from "@/services/detectionService";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// Props for AlertCard (detection data and if it's current)
interface AlertCardProps {
  detection: Detection;
  isCurrent?: boolean;
}

// Main alert card component
const AlertCard: React.FC<AlertCardProps> = ({ detection, isCurrent = false }) => {
  // Format detection time and date
  const date = new Date(detection.time);
  const formattedTime = date.toLocaleTimeString();
  const formattedDate = date.toLocaleDateString();
  const { isAdmin, isFieldAgent } = useAuth();
  
  // Handle acknowledge button click
  const handleAcknowledge = async () => {
    if (detection.id) {
      await acknowledgeDetection(detection.id);
    }
  };

  // Only admins/field agents can acknowledge alerts
  const canAcknowledge = isAdmin || isFieldAgent;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      isCurrent ? "border-alert" : "border-muted"
    )}>
      <CardHeader className={cn(
        "py-3", 
        isCurrent ? "bg-alert text-alert-foreground" : "bg-muted"
      )}>
        <CardTitle className="flex items-center gap-2 text-lg">
          {isCurrent && <AlertTriangle className="h-5 w-5" />}
          {isCurrent ? "Current Alert" : "Past Alert"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {/* Detection details */}
          <div className="grid grid-cols-[1fr_2fr] gap-1">
            <span className="font-semibold">Time:</span>
            <span>{formattedTime}</span>
          </div>
          <div className="grid grid-cols-[1fr_2fr] gap-1">
            <span className="font-semibold">Date:</span>
            <span>{formattedDate}</span>
          </div>
          <div className="grid grid-cols-[1fr_2fr] gap-1">
            <span className="font-semibold">Location:</span>
            <span>{detection.location}</span>
          </div>
          <div className="grid grid-cols-[1fr_2fr] gap-1">
            <span className="font-semibold">Action:</span>
            <span>{detection.action_taken}</span>
          </div>
        </div>
      </CardContent>
      {/* Show acknowledge button if current, unacknowledged, and user has permission */}
      {isCurrent && !detection.acknowledged && canAcknowledge && (
        <CardFooter className="flex justify-center gap-2 border-t pt-3">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleAcknowledge}
          >
            <Check className="w-4 h-4 mr-2" /> Acknowledge
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default AlertCard;
