
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export const useNotifications = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);

  useEffect(() => {
    const requestNotificationPermission = async () => {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        setNotificationsEnabled(permission === "granted");
        
        if (permission === "granted") {
          toast({
            title: "Notifications Enabled",
            description: "You will receive alerts when honey badgers are detected."
          });
          console.log("Notifications enabled successfully");
        } else {
          console.log("Notification permission denied:", permission);
          toast({
            title: "Notifications Disabled",
            description: "Please enable notifications to receive alerts when honey badgers are detected.",
            variant: "destructive"
          });
        }
      } else {
        console.log("Notifications not supported in this browser");
        toast({
          title: "Notifications Not Supported",
          description: "Your browser doesn't support notifications.",
          variant: "destructive"
        });
      }
    };

    requestNotificationPermission();
  }, []);

  return { notificationsEnabled };
};
