import React from 'react';

interface AppleStoreIconProps {
  className?: string;
  size?: number;
}

export const AppleStoreIcon: React.FC<AppleStoreIconProps> = ({ className = '', size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-md select-none ${className}`}
    >
      <defs>
        {/* Authentic Apple App Store Rich Gradient */}
        <linearGradient id="appleBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2ba3ff" />
          <stop offset="45%" stopColor="#0071e3" />
          <stop offset="100%" stopColor="#0058ba" />
        </linearGradient>

        {/* Subtle glass reflection highlight on squircle */}
        <linearGradient id="appleGlassLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
        </linearGradient>

        {/* Stick overlap drop shadow for authentic layered 3D depth */}
        <filter id="stickShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#003777" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Official Apple Squircle Rounded Base (Continuous curvature) */}
      <rect width="120" height="120" rx="27" fill="url(#appleBgGrad)" />
      <rect width="120" height="120" rx="27" fill="url(#appleGlassLight)" />

      {/* Official Apple App Store Capital "A" - Crafted from 3 overlapping rounded craft sticks */}
      <g filter="url(#stickShadow)">
        {/* Stick 1: Left diagonal leg going up to apex */}
        <line
          x1="32"
          y1="94"
          x2="60"
          y2="27"
          stroke="white"
          strokeWidth="11"
          strokeLinecap="round"
        />

        {/* Stick 2: Horizontal crossbar across the middle */}
        <line
          x1="25"
          y1="68"
          x2="95"
          y2="68"
          stroke="white"
          strokeWidth="11"
          strokeLinecap="round"
        />

        {/* Stick 3: Right diagonal leg coming down from apex, layered over horizontal bar */}
        <line
          x1="60"
          y1="27"
          x2="88"
          y2="94"
          stroke="white"
          strokeWidth="11"
          strokeLinecap="round"
        />

        {/* Top apex precision cap cap-join */}
        <circle cx="60" cy="27" r="5.5" fill="white" />
      </g>
    </svg>
  );
};
