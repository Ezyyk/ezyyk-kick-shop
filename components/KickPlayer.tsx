"use client";
import React, { useEffect, useState, useRef } from "react";
import styles from "./KickPlayer.module.css";

interface KickPlayerProps {
  channelName: string;
  onPing: () => void;
}

export default function KickPlayer({ channelName, onPing }: KickPlayerProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });

  // Points are now awarded via Kick webhooks (chat activity, subs, kicks)
  // No more auto-ping needed

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition({
      x: dragStartRef.current.initialX + dx,
      y: dragStartRef.current.initialY + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    setIsSnapping(true);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    // Calculate nearest corner
    const playerElement = (e.target as HTMLElement).closest(`.${styles.floatingPlayer}`);
    if (playerElement) {
      const rect = playerElement.getBoundingClientRect();
      const margin = 24;
      const playerWidth = rect.width;
      const playerHeight = rect.height;
      
      const maxLeftX = -(window.innerWidth - playerWidth - margin * 2);
      const maxTopY = -(window.innerHeight - playerHeight - margin * 2);

      // Determine center of the player
      const centerX = rect.left + playerWidth / 2;
      const centerY = rect.top + playerHeight / 2;

      // Check quadrant
      const isLeft = centerX < window.innerWidth / 2;
      const isTop = centerY < window.innerHeight / 2;

      let targetX = isLeft ? maxLeftX : 0;
      let targetY = isTop ? maxTopY : 0;

      setPosition({ x: targetX, y: targetY });

      // Remove snapping class after transition
      setTimeout(() => setIsSnapping(false), 300);
    }
  };

  return (
    <div 
      className={`${styles.floatingPlayer} ${isSnapping ? styles.snapping : ""} ${isDragging ? styles.dragging : ""}`}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      <div 
        className={styles.dragHandle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className={styles.dragIcon}></div>
      </div>
      
      {/* Overlay to prevent iframe from stealing mouse events during drag */}
      {isDragging && (
        <div style={{ position: "absolute", top: 24, left: 0, right: 0, bottom: 0, zIndex: 10, background: "transparent" }}></div>
      )}
      
      <iframe
        src={`https://player.kick.com/${channelName}?parent=${typeof window !== 'undefined' ? window.location.hostname : 'ezyyk.com'}`}
        frameBorder="0"
        scrolling="no"
        allowFullScreen={true}
        className={styles.iframe}
      ></iframe>
    </div>
  );
}
