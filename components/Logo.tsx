import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      className={`${className} rounded-full shadow-lg shadow-blue-500/20`}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="url(#grad1)" />
      <circle cx="50" cy="50" r="48" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />

      <text x="50" y="65" fontFamily="sans-serif" fontSize="45" fontWeight="bold" fill="white" textAnchor="middle">CF</text>
    </svg>
  );
};
