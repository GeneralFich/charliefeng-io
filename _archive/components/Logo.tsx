import React from 'react';

interface LogoProps {
  className?: string;
}

/**
 * Animated site logo.
 *
 * Enhancements over the original:
 * - Pulsing outer ring (SVG animate) — a living "heartbeat"
 * - Orbiting cyan particle on a circular <animateMotion> path —
 *   evokes a satellite/electron, fitting the AI/infrastructure theme
 * - Glow filter on the orbiting particle
 */
export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      className={`${className} rounded-full`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cf-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#2563eb" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>

        {/* Glow filter for the orbiting dot */}
        <filter id="cf-orbit-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Circular orbit path centred at (50,50) radius 48 — four quarter-arcs */}
        <path
          id="cf-orbit-path"
          d="M 98,50 A 48,48 0 0 1 50,98 A 48,48 0 0 1 2,50 A 48,48 0 0 1 50,2 A 48,48 0 0 1 98,50"
        />
      </defs>

      {/* Pulsing outer ring */}
      <circle cx="50" cy="50" r="48" stroke="#60a5fa" strokeWidth="1.5" fill="none">
        <animate attributeName="r"
          values="46;50;46" dur="3s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" />
        <animate attributeName="stroke-opacity"
          values="0.08;0.40;0.08" dur="3s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" />
      </circle>

      {/* Main circle */}
      <circle cx="50" cy="50" r="44" fill="url(#cf-logo-grad)" />
      <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />

      {/* CF logotype */}
      <text x="50" y="63" fontFamily="sans-serif" fontSize="40" fontWeight="bold"
        fill="white" textAnchor="middle">CF</text>

      {/* Orbiting cyan particle */}
      <circle r="3.2" fill="#22d3ee" filter="url(#cf-orbit-glow)">
        <animateMotion dur="5s" repeatCount="indefinite">
          <mpath href="#cf-orbit-path" />
        </animateMotion>
        <animate attributeName="opacity"
          values="0.65;1;0.65" dur="2.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
};
