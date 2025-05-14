
import { supabase } from "@/integrations/supabase/client";
import { Detection } from "@/types/detection";
import { toast } from "@/hooks/use-toast";
import { formatInTimeZone } from 'date-fns-tz';

// Helper function to play alarm sound
const playAlarmSound = () => {
  const audio = new Audio('/alarm.mp3');
  audio.volume = 0.7; // Set to 70% volume by default
  audio.play().catch(error => {
    console.error("Error playing alarm sound:", error);
  });
};

// Helper function to convert Supabase detection to our Detection type
const mapSupabaseDetection = (record: any): Detection => ({
  id: record.id,
  location: record.location,
  time: record.time,
  action_taken: record.action_taken,
  acknowledged: record.acknowledged
});

// Helper function to format date for South African timezone (SAST/UTC+2)
const formatDateWithSATimezone = (date: Date): string => {
  // Use date-fns-tz to format the date in South African timezone
  // South Africa uses SAST which is UTC+2
  const saTimeZone = 'Africa/Johannesburg';
  
  // Format the date in ISO format with the correct timezone offset
  return formatInTimeZone(date, saTimeZone, "yyyy-MM-dd'T'HH:mm:ssxxx");
};

// Helper function to handle authentication errors
const handleAuthError = (error: any) => {
  if (error?.message?.includes('JWT')) {
    toast({
      title: "Authentication Error",
      description: "Please log in to continue",
      variant: "destructive",
    });
    
    // Redirect to login if we're in a browser environment
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
  }
};

export const getRecentDetections = async (limit = 5): Promise<Detection[]> => {
  try {
    const { data, error } = await supabase
      .from("detections")
      .select("*")
      .eq("acknowledged", true)  // Only get acknowledged detections for history
      .order("time", { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error fetching detections:", error);
      handleAuthError(error);
      return [];
    }
    
    return data.map(mapSupabaseDetection);
  } catch (error) {
    console.error("Failed to fetch detections:", error);
    return [];
  }
};

export const getMostRecentDetection = async (): Promise<Detection | null> => {
  try {
    const { data, error } = await supabase
      .from("detections")
      .select("*")
      .eq("acknowledged", false)  // Only get unacknowledged detections
      .order("time", { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, not an error
        return null;
      }
      console.error("Error fetching most recent detection:", error);
      handleAuthError(error);
      return null;
    }
    
    return mapSupabaseDetection(data);
  } catch (error) {
    console.error("Failed to fetch most recent detection:", error);
    return null;
  }
};

export const getUnacknowledgedDetections = async (): Promise<Detection[]> => {
  try {
    const { data, error } = await supabase
      .from("detections")
      .select("*")
      .eq("acknowledged", false)
      .order("time", { ascending: false });
    
    if (error) {
      console.error("Error fetching unacknowledged detections:", error);
      handleAuthError(error);
      return [];
    }
    
    return data.map(mapSupabaseDetection);
  } catch (error) {
    console.error("Failed to fetch unacknowledged detections:", error);
    return [];
  }
};

// Function to send email alert
const sendEmailAlert = async (detection: Omit<Detection, "id" | "acknowledged">) => {
  try {
    const { error } = await supabase.functions.invoke("send-detection-alert", {
      body: {
        location: detection.location,
        time: detection.time,
        action_taken: detection.action_taken
      }
    });

    if (error) {
      console.error("Error sending email alert:", error);
      handleAuthError(error);
      return false;
    }

    console.log("Email alert sent successfully");
    return true;
  } catch (error) {
    console.error("Failed to send email alert:", error);
    return false;
  }
};

export const addDetection = async (detection: Omit<Detection, "id" | "acknowledged">): Promise<void> => {
  try {
    // Create a new Date object for the current time
    const localTime = new Date();
    
    // Format the date in South African timezone
    const formattedTime = formatDateWithSATimezone(localTime);
    
    const { error } = await supabase
      .from("detections")
      .insert({
        location: detection.location,
        time: formattedTime,
        action_taken: detection.action_taken,
        acknowledged: false
      });
    
    if (error) {
      console.error("Error adding detection:", error);
      handleAuthError(error);
      toast({
        title: "Error",
        description: "Failed to add detection. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Send email alert with the properly formatted time
    sendEmailAlert({
      location: detection.location,
      time: formattedTime,
      action_taken: detection.action_taken
    });
    
    // Display the time in the local format for the toast
    const displayTime = formatInTimeZone(localTime, 'Africa/Johannesburg', 'HH:mm:ss');
    
    toast({
      title: "🚨 Alert: Honey Badger Detected!",
      description: `Location: ${detection.location} at ${displayTime}`,
      variant: "destructive",
    });
  } catch (error) {
    console.error("Failed to add detection:", error);
    toast({
      title: "Error",
      description: "Failed to add detection. Please try again.",
      variant: "destructive",
    });
  }
};

export const acknowledgeDetection = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("detections")
      .update({ acknowledged: true })
      .eq("id", id);
    
    if (error) {
      console.error("Error acknowledging detection:", error);
      handleAuthError(error);
      toast({
        title: "Error",
        description: "Failed to acknowledge alert. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Alert Acknowledged",
      description: "The alert has been marked as acknowledged.",
    });
  } catch (error) {
    console.error("Failed to acknowledge detection:", error);
    toast({
      title: "Error",
      description: "Failed to acknowledge alert. Please try again.",
      variant: "destructive",
    });
  }
};
