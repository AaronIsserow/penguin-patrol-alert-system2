// DashboardContent: Main dashboard layout and controller
import React from "react";
import StatusIndicator from "@/components/StatusIndicator"; // Shows system status (alert/clear)
import AlertCard from "@/components/AlertCard"; // Displays individual alert info
import CameraFeed, { PiControl } from "@/components/CameraFeed"; // Live video feed and camera controls
import InfoBox from "@/components/InfoBox"; // Extra info/tips
import AddAlertForm from "@/components/AddAlertForm"; // Simulate detection form
import AlertHistoryDialog from "@/components/AlertHistoryDialog"; // Alert history and export
import { Detection } from "@/types/detection";
import { Settings as SettingsType } from "@/types/settings";
import Chatbot from "@/components/Chatbot"; // User help/chatbot

// Props for dashboard content (data and callbacks)
interface DashboardContentProps {
  loading: boolean;
  currentDetections: Detection[];
  recentDetections: Detection[];
  newestDetection: Detection | null;
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
  onFetchData: () => void;
}

// Main dashboard component
const DashboardContent: React.FC<DashboardContentProps> = ({
  loading,
  currentDetections,
  recentDetections,
  newestDetection,
  settings,
  onSettingsChange,
  onFetchData
}) => {
  // Show loading spinner if data is loading
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // State to track if countdown is active
  const [cameraCountdown, setCameraCountdown] = React.useState(false);

  return (
    <div className="container">
      {/* Top: Status indicator */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-grow mr-4">
          <StatusIndicator isDetected={currentDetections.length > 0} />
        </div>
      </div>

      {/* Main grid layout: 3 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left column: Chatbot/help */}
        <div className="md:col-span-1">
          <Chatbot />
        </div>
        {/* Center column: Current alerts and history */}
        <div className="md:col-span-2 space-y-6">
          {currentDetections.length > 0 ? (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3">Current Alerts</h2>
              <div className="space-y-3">
                {/* List of current alerts */}
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
            // No current alerts message
            <div className="mb-6 p-6 border rounded-lg bg-muted/20 text-center">
              <h2 className="text-xl font-bold mb-2">No Current Alerts</h2>
              <p className="text-muted-foreground">All clear! No honey badgers detected.</p>
            </div>
          )}
          {/* Alert history dialog (view/export past alerts) */}
          <div className="flex justify-end">
            <AlertHistoryDialog 
              detections={recentDetections}
              currentDetectionId={newestDetection?.id}
              onRefresh={onFetchData}
            />
          </div>
        </div>
        {/* Right column: Camera controls, feed, info, simulate detection */}
        <div className="space-y-6">
          <PiControl onCountdownChange={setCameraCountdown} />
          <CameraFeed cameraDisabled={cameraCountdown} />
          <InfoBox />
          <AddAlertForm onAlertAdded={onFetchData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
