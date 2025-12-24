import React, { useEffect, useRef } from 'react';

export const ScrollProgress: React.FC = () => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    let rafId: number;

    const handleScroll = () => {
      if (!ticking) {
        rafId = window.requestAnimationFrame(() => {
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const scrollTop = window.scrollY;

          const scrollableHeight = documentHeight - windowHeight;

          if (progressRef.current) {
            if (scrollableHeight <= 0 || scrollTop <= 0) {
              progressRef.current.style.width = '0%';
              progressRef.current.style.opacity = '0';
            } else {
              const scrolled = (scrollTop / scrollableHeight) * 100;
              const width = Math.min(100, Math.max(0, scrolled));
              progressRef.current.style.width = `${width}%`;
              progressRef.current.style.opacity = '1';
            }
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      ref={progressRef}
      className="fixed top-[64px] left-0 h-1 bg-blue-500 z-50 print:hidden shadow-[0_0_10px_#3b82f6] overflow-hidden transition-opacity duration-300 ease-in-out"
      style={{ width: '0%', opacity: 0 }}
      aria-hidden="true"
    >
      <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-blue-300 to-transparent shadow-[0_0_15px_#60a5fa]"></div>
    </div>
  );
};
