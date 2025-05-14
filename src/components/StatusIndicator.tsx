
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  isDetected: boolean;
}

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
