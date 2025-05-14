
import { useState, useEffect } from "react";

export const useSystemTime = () => {
  const [systemTime, setSystemTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return systemTime;
};
