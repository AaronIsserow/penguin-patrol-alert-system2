// StatusIndicator: Shows current system status (alert or all clear)
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Props for StatusIndicator (isDetected: is an alert active?)
interface StatusIndicatorProps {
  isDetected: boolean;
}

// Main status indicator component
const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isDetected }) => {
  return (
    <Card className={cn(
      "border-2",
      isDetected 
        ? "border-alert bg-alert/10 animate-pulse" 
        : "border-safe bg-safe/10"
    )}>
      <CardContent className="p-4 flex items-center justify-center">
        <div className="text-xl font-bold flex items-center gap-2">
          {/* Show alert or all clear status */}
          {isDetected ? (
            <>
              <span className="text-2xl">🔴</span>
              <span className="text-alert">Honey Badger Detected!</span>
            </>
          ) : (
            <>
              <span className="text-2xl">🟢</span>
              <span className="text-safe">All Clear</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusIndicator;
