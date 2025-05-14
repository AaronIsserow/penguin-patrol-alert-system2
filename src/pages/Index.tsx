
import React, { useEffect } from "react";
import Header from "@/components/layout/Header";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DetectionModal from "@/components/DetectionModal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDetections } from "@/hooks/useDetections";
import { useSystemTime } from "@/hooks/useSystemTime";
import { useNotifications } from "@/hooks/useNotifications";

const Index = () => {
  const [showDetectionModal, setShowDetectionModal] = React.useState<boolean>(false);
  const [settings, setSettings] = useLocalStorage("hbds-settings", {
    alertVolume: 70,
    detectionSensitivity: "Medium"
  });

  const { 
    recentDetections, 
    currentDetections, 
    loading, 
    newestDetection, 
    setNewestDetection,
    fetchData 
  } = useDetections();

  const systemTime = useSystemTime();
  const { notificationsEnabled } = useNotifications();

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  useEffect(() => {
    if (newestDetection) {
      setShowDetectionModal(true);
    }
  }, [newestDetection]);

  const handleDetectionAcknowledged = () => {
    fetchData();
    setShowDetectionModal(false);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header systemTime={systemTime} />
      
      <DashboardContent 
        loading={loading}
        currentDetections={currentDetections}
        recentDetections={recentDetections}
        newestDetection={newestDetection}
        settings={settings}
        onSettingsChange={setSettings}
        onFetchData={fetchData}
      />

      {showDetectionModal && newestDetection && (
        <DetectionModal 
          detection={newestDetection}
          onClose={() => setShowDetectionModal(false)}
          onAcknowledged={handleDetectionAcknowledged}
        />
      )}
    </div>
  );
};

export default Index;
