import React from "react";
import StatusIndicator from "@/components/StatusIndicator";
import AlertCard from "@/components/AlertCard";
import CameraFeed, { PiControl } from "@/components/CameraFeed";
import InfoBox from "@/components/InfoBox";
import AddAlertForm from "@/components/AddAlertForm";
import AlertHistoryDialog from "@/components/AlertHistoryDialog";
import { Detection } from "@/types/detection";
import { Settings as SettingsType } from "@/types/settings";
import Chatbot from "@/components/Chatbot";

interface DashboardContentProps {
  loading: boolean;
  currentDetections: Detection[];
  recentDetections: Detection[];
  newestDetection: Detection | null;
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
  onFetchData: () => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  loading,
  currentDetections,
  recentDetections,
  newestDetection,
  settings,
  onSettingsChange,
  onFetchData
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-grow mr-4">
          <StatusIndicator isDetected={currentDetections.length > 0} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left column: Chatbot */}
        <div className="md:col-span-1">
          <Chatbot />
        </div>
        {/* Main dashboard content */}
        <div className="md:col-span-2 space-y-6">
          {currentDetections.length > 0 ? (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3">Current Alerts</h2>
              <div className="space-y-3">
                {currentDetections.map(detection => (
                  <AlertCard 
                    key={detection.id} 
                    detection={detection} 
                    isCurrent={true} 
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6 p-6 border rounded-lg bg-muted/20 text-center">
              <h2 className="text-xl font-bold mb-2">No Current Alerts</h2>
              <p className="text-muted-foreground">All clear! No honey badgers detected.</p>
            </div>
          )}
          <div className="flex justify-end">
            <AlertHistoryDialog 
              detections={recentDetections}
              currentDetectionId={newestDetection?.id}
            />
          </div>
        </div>
        {/* Right column: PiControl, Camera, Info, Add Alert */}
        <div className="space-y-6">
          <PiControl />
          <CameraFeed />
          <InfoBox />
          <AddAlertForm onAlertAdded={onFetchData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
