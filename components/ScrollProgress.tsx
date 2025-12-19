import React, { useEffect, useState } from 'react';

export const ScrollProgress: React.FC = () => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      const scrollableHeight = documentHeight - windowHeight;

      if (scrollableHeight <= 0) {
        setWidth(0);
        return;
      }

      const scrolled = (scrollTop / scrollableHeight) * 100;
      setWidth(Math.min(100, Math.max(0, scrolled)));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (width === 0) return null;

  return (
    <div className="fixed top-[64px] left-0 h-1 bg-blue-500 z-50 print:hidden shadow-[0_0_10px_#3b82f6]" style={{ width: `${width}%` }} aria-hidden="true">
      <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-blue-300 to-transparent shadow-[0_0_15px_#60a5fa]"></div>
    </div>
  );
};
