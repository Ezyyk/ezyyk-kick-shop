"use client";
import React, { useEffect, useState, useRef } from "react";
import { Gift, Clock } from "lucide-react";

export default function CodeDropWidget() {
  const [lastCodeDrop, setLastCodeDrop] = useState<number>(0);
  const [latestCode, setLatestCode] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [serverOffset, setServerOffset] = useState<number>(0);
  
  // State for showing the dropped code
  const [showCode, setShowCode] = useState<boolean>(false);
  const [codeTimer, setCodeTimer] = useState<number>(0);
  
  const CODE_DROP_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
  const DISPLAY_CODE_DURATION_MS = 60 * 1000; // Show code for 60 seconds after drop

  // Use a ref to keep track of the current lastCodeDrop for the fetchData closure
  const lastCodeDropRef = useRef(0);

  // Poll API for updates every 5 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/widget-data", { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setIsLive(data.isLive);
          
          // Synchronize time with server to handle client/server clock drift
          const now = Date.now();
          const offset = data.serverTime - now;
          setServerOffset(offset);
          
          const currentLastDrop = lastCodeDropRef.current;
          
          // Check if a new code just dropped
          if (data.lastCodeDrop > currentLastDrop && currentLastDrop !== 0) {
            // New drop detected!
            setLatestCode(data.latestCode);
            setShowCode(true);
            setCodeTimer(DISPLAY_CODE_DURATION_MS);
          } else if (currentLastDrop === 0) {
            // Initial load
            setLatestCode(data.latestCode);
            
            // If the code was dropped within the display duration, show it
            const adjustedNow = Date.now() + offset;
            const timeSinceDrop = adjustedNow - data.lastCodeDrop;
            
            if (timeSinceDrop < DISPLAY_CODE_DURATION_MS && timeSinceDrop >= 0) {
              setShowCode(true);
              setCodeTimer(DISPLAY_CODE_DURATION_MS - timeSinceDrop);
            }
          }
          
          setLastCodeDrop(data.lastCodeDrop);
          lastCodeDropRef.current = data.lastCodeDrop;
        }
      } catch (error) {
        console.error("Error fetching widget data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle countdown timers locally
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now() + serverOffset;
      
      // Handle the code display timer
      if (showCode) {
        setCodeTimer(prev => {
          if (prev <= 1000) {
            setShowCode(false);
            return 0;
          }
          return prev - 1000;
        });
      }
      
      // Handle the next drop countdown
      if (lastCodeDrop > 0) {
        const nextDropTime = lastCodeDrop + CODE_DROP_INTERVAL_MS;
        const remaining = nextDropTime - now;
        setTimeLeft(remaining > 0 ? remaining : 0);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [lastCodeDrop, showCode, serverOffset]);

  // Format time for display (MM:SS)
  const formatTime = (ms: number) => {
    if (ms <= 0 && lastCodeDrop > 0) return "BRZY...";
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // If not live, display a waiting state
  if (!isLive) {
    return (
      <div className="obs-widget-container glass-panel">
        <Clock className="widget-icon inactive" size={24} />
        <span className="widget-text">Waiting for stream...</span>
      </div>
    );
  }

  return (
    <div className={`obs-widget-container glass-panel ${showCode ? 'code-active' : ''}`}>
      {showCode ? (
        <div className="widget-code-display">
          <Gift className="widget-icon pulse-icon" size={28} color="#00e5ff" />
          <div className="widget-code-info">
            <span className="widget-label">CODE DROP</span>
            <span className="widget-code">{latestCode}</span>
          </div>
        </div>
      ) : (
        <div className="widget-countdown-display">
          <Clock className="widget-icon" size={24} color="#b366ff" />
          <div className="widget-timer-info">
            <span className="widget-label">DALŠÍ KÓD ZA</span>
            <span className="widget-timer">{formatTime(timeLeft)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
