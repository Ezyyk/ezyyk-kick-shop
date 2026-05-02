import React from "react";

interface GemIconProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export default function GemIcon({ size = 18, className = "", glow = true }: GemIconProps) {
  return (
    <div 
      className={`gem-icon-container ${className}`} 
      style={{ 
        width: size, 
        height: size, 
        display: "inline-flex", 
        alignItems: "center", 
        justifyContent: "center",
        position: "relative"
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: glow ? "drop-shadow(0 0 4px rgba(0, 229, 255, 0.6))" : "none",
        }}
      >
        {/* Main Diamond Shape */}
        <path
          d="M6 3L18 3L22 9L12 21L2 9L6 3Z"
          fill="url(#gem_grad)"
          stroke="#00e5ff"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        
        {/* Facets / Depth lines */}
        <path
          d="M6 3L12 9V21"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <path
          d="M18 3L12 9"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <path
          d="M2 9L12 9L22 9"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.8"
        />
        <path
          d="M6 3L2 9"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.8"
        />
        <path
          d="M18 3L22 9"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.8"
        />
        
        {/* Shine Sparkle */}
        <path
          d="M8 6L10 8M14 5L15 6"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.8"
        >
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="3s" repeatCount="indefinite" />
        </path>

        {/* Moving Shimmer Facet */}
        <path
          d="M6 3L12 9L18 3"
          fill="rgba(255,255,255,0.1)"
        >
          <animate attributeName="fill" values="rgba(255,255,255,0.1);rgba(255,255,255,0.4);rgba(255,255,255,0.1)" dur="2s" repeatCount="indefinite" />
        </path>

        <defs>
          <linearGradient id="gem_grad" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00e5ff" />
            <stop offset="0.5" stopColor="#00d4ff" />
            <stop offset="1" stopColor="#0080ff" />
          </linearGradient>
        </defs>
      </svg>

      
      {glow && (
        <div 
          className="gem-pulse"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "50%",
            background: "rgba(0, 229, 255, 0.2)",
            filter: "blur(8px)",
            zIndex: -1,
            animation: "gem-pulse 2s infinite ease-in-out"
          }}
        />
      )}
    </div>
  );
}
