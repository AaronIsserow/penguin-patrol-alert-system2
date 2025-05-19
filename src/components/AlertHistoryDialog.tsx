// AlertHistoryDialog: Dialog for viewing and exporting alert history
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LayoutList, Download } from "lucide-react";
import AlertHistory from "@/components/AlertHistory";
import { Detection } from "@/types/detection";
import { supabase } from "@/integrations/supabase/client";

// Props for AlertHistoryDialog (detections and optional highlight)
interface AlertHistoryDialogProps {
  detections: Detection[];
  currentDetectionId?: string;
  onRefresh?: () => void;
}

// Main dialog component
const AlertHistoryDialog: React.FC<AlertHistoryDialogProps> = ({ 
  detections,
  currentDetectionId,
  onRefresh
}) => {
  // Handle CSV export of alert history
  const handleDownloadCSV = async () => {
    // Fetch the most recent 50 detections from Supabase
    const { data, error } = await supabase
      .from("detections")
      .select("*")
      .order("time", { ascending: false })
      .limit(50);
    if (error) {
      alert("Failed to fetch detections for CSV export.");
      return;
    }
    // Sort detections by time (newest first)
    const sortedDetections = [...data].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );
    // Create CSV content
    const headers = ["Time", "Location", "Action Taken", "Status"];
    const rows = sortedDetections.map(d => [
      new Date(d.time).toLocaleString(),
      d.location,
      d.action_taken,
      d.acknowledged ? "Acknowledged" : "Unacknowledged"
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    // Create downloadable CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `honey-badger-alerts-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    // Dialog for alert history
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <LayoutList className="h-4 w-4" />
          View Alert History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Alert History</DialogTitle>
          {/* Export CSV button */}
          <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {/* Show alert history table */}
          <AlertHistory 
            detections={detections}
            currentDetectionId={currentDetectionId}
            onRefresh={onRefresh}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlertHistoryDialog;
