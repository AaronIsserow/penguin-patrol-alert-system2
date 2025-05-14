
import { useState, useCallback } from "react";
import { Detection } from "@/types/detection";
import { getRecentDetections, getUnacknowledgedDetections } from "@/services/detectionService";

export const useDetections = () => {
  const [recentDetections, setRecentDetections] = useState<Detection[]>([]);
  const [currentDetections, setCurrentDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newestDetection, setNewestDetection] = useState<Detection | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const detections = await getRecentDetections(5);
      setRecentDetections(detections);
      
      const unacknowledged = await getUnacknowledgedDetections();
      
      // Check if there are any new detections
      const newDetections = unacknowledged.filter(
        detection => !currentDetections.some(
          current => current.id === detection.id
        )
      );
      
      // Show notification and modal for newest detection
      if (newDetections.length > 0) {
        console.log(`Found ${newDetections.length} new detections`);
        
        // Sort new detections by time (newest first)
        const sortedNewDetections = [...newDetections].sort((a, b) => 
          new Date(b.time).getTime() - new Date(a.time).getTime()
        );
        
        const newest = sortedNewDetections[0];
        setNewestDetection(newest);
      }
      
      setCurrentDetections(unacknowledged);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDetections]);

  return {
    recentDetections,
    currentDetections,
    loading,
    newestDetection,
    setNewestDetection,
    fetchData
  };
};
