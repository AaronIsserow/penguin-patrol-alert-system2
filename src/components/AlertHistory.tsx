// AlertHistory: Displays a table of past detection alerts
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Detection } from "@/types/detection";
import { acknowledgeAllDetections } from "@/services/detectionService";
import { useAuth } from "@/context/AuthContext";

// Props for AlertHistory (list of detections, optional highlight)
interface AlertHistoryProps {
  detections: Detection[];
  currentDetectionId?: string;
  onRefresh?: () => void;
}

// Main alert history component
const AlertHistory: React.FC<AlertHistoryProps> = ({ 
  detections, 
  currentDetectionId
}) => {
  // Sort detections by time (newest first)
  const sortedDetections = [...detections].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Alert History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {sortedDetections.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Action Taken</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Render each detection as a table row */}
                {sortedDetections.map((detection) => (
                  <TableRow key={detection.id} className={detection.id === currentDetectionId ? "bg-muted" : ""}>
                    <TableCell className="font-mono whitespace-nowrap">
                      {new Date(detection.time).toLocaleString()}
                    </TableCell>
                    <TableCell>{detection.location}</TableCell>
                    <TableCell>{detection.action_taken}</TableCell>
                    <TableCell>
                      <Badge variant={detection.acknowledged ? "outline" : "destructive"}>
                        {detection.acknowledged ? "Acknowledged" : "New Alert"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            // Show message if no history
            <div className="text-center text-muted-foreground p-8">
              No detection history available
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AlertHistory;
