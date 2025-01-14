import React, { useState, useEffect } from "react";

interface TimerProps {
  onTimeUpdate: (seconds: number) => void;
  reset?: boolean;
}

const Timer = ({ onTimeUpdate, reset }: TimerProps) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (reset) {
      setSeconds(0);
    }
  }, [reset]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => {
        const newTime = prev + 1;
        // Convert to milliseconds before sending to parent
        onTimeUpdate(newTime * 1000);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onTimeUpdate]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-2xl font-mono text-center mb-4">
      {formatTime(seconds)}
    </div>
  );
};

export default Timer;