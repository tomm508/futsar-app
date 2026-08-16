import React from 'react';

interface FutsarLogoProps {
  className?: string;
  size?: number | string;
}

export const FutsarClubLogo: React.FC<FutsarLogoProps> = ({ 
  className = "w-full h-full", 
  size = 44 
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      width={typeof size === 'number' ? size : undefined}
      height={typeof size === 'number' ? size : undefined}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Metallic Gold Gradients */}
        <linearGradient id="goldPlate" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff2a3" />
          <stop offset="30%" stopColor="#e5ba37" />
          <stop offset="70%" stopColor="#aa7c11" />
          <stop offset="100%" stopColor="#684b05" />
        </linearGradient>

        <linearGradient id="goldBorder" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#875e0e" />
          <stop offset="25%" stopColor="#ffe885" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="75%" stopColor="#fff5b8" />
          <stop offset="100%" stopColor="#91650d" />
        </linearGradient>

        <linearGradient id="shieldDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e180d" />
          <stop offset="50%" stopColor="#0d0d0d" />
          <stop offset="100%" stopColor="#050505" />
        </linearGradient>

        <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd700" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#d4af37" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <filter id="neonShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#ffd700" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Ambient Glow */}
      <circle cx="50" cy="50" r="46" fill="url(#goldGlow)" />

      {/* Outer Shield Border */}
      <path
        d="M50 6 L84 18 C84 55 68 80 50 94 C32 80 16 55 16 18 Z"
        fill="url(#goldBorder)"
        stroke="#ffd700"
        strokeWidth="1.5"
        filter="url(#neonShadow)"
      />

      {/* Inner Shield Body */}
      <path
        d="M50 11 L80 21.5 C80 53 65.5 75.5 50 88 C34.5 75.5 20 53 20 21.5 Z"
        fill="url(#shieldDark)"
        stroke="url(#goldPlate)"
        strokeWidth="1"
      />

      {/* Subtle Shield Inner Stripe Texture */}
      <path
        d="M50 14 L76 23.5 C74 42 67 60 50 78 C33 60 26 42 24 23.5 Z"
        fill="none"
        stroke="rgba(212,175,55,0.15)"
        strokeWidth="1.5"
      />

      {/* Stars on top */}
      <g fill="url(#goldPlate)">
        {/* Center Star */}
        <polygon points="50,17 51.5,21.5 56,21.5 52.5,24 53.8,28.5 50,26 46.2,28.5 47.5,24 44,21.5 48.5,21.5" />
        {/* Left Small Star */}
        <polygon points="38,22 39,24.5 41.5,24.5 39.5,26 40.2,28.5 38,27 35.8,28.5 36.5,26 34.5,24.5 37,24.5" transform="scale(0.8) translate(10, 5)" />
        {/* Right Small Star */}
        <polygon points="62,22 63,24.5 65.5,24.5 63.5,26 64.2,28.5 62,27 59.8,28.5 60.5,26 58.5,24.5 61,24.5" transform="scale(0.8) translate(15, 5)" />
      </g>

      {/* Stylized Modern Metallic 3D Letter 'F' */}
      <g filter="url(#neonShadow)">
        {/* Main Stem of F */}
        <path
          d="M36 34 H66 L63 43 H46 V50 H60 L57 58 H46 V76 H36 Z"
          fill="url(#goldPlate)"
        />
        {/* Bevel highlight on F */}
        <path
          d="M36 34 L40 38 H62 L66 34 Z"
          fill="#fff6c4"
        />
        <path
          d="M46 50 L49 53 H58 L60 50 Z"
          fill="#fff6c4"
        />
        <path
          d="M36 34 L39 37 V73 L36 76 Z"
          fill="#fff3b0"
          opacity="0.8"
        />
      </g>

      {/* Mini Golden Futsal Ball / Geometric Accent at bottom right */}
      <circle cx="64" cy="67" r="7" fill="#0d0d0d" stroke="url(#goldBorder)" strokeWidth="1.5" />
      <circle cx="64" cy="67" r="3" fill="url(#goldPlate)" />
    </svg>
  );
};
