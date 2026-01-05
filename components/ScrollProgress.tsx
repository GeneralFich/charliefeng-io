import React, { useEffect, useRef, RefObject } from 'react';

interface ScrollProgressProps {
  containerRef?: RefObject<HTMLElement | null>;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({ containerRef }) => {
  const progressRef = useRef<HTMLDivElement>(null);
  // Cache the scrollable height to avoid layout thrashing
  const maxScrollRef = useRef<number>(0);

  useEffect(() => {
    let ticking = false;
    let rafId: number;

    const target = containerRef?.current || window;
    const documentElement = document.documentElement;
    // If containerRef is provided, use it. Otherwise use document.documentElement (for window scroll)
    const elementToMeasure = (containerRef?.current as HTMLElement) || documentElement;

    // Update dimensions only when necessary (resize/layout change)
    const updateDimensions = () => {
      let windowHeight: number;
      let scrollHeight: number;

      if (containerRef?.current) {
        windowHeight = containerRef.current.clientHeight;
        scrollHeight = containerRef.current.scrollHeight;
      } else {
        windowHeight = window.innerHeight;
        scrollHeight = documentElement.scrollHeight;
      }

      // Ensure we don't get negative values
      maxScrollRef.current = Math.max(0, scrollHeight - windowHeight);
    };

    // Use ResizeObserver to detect content height changes efficiently
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef?.current) {
        resizeObserver.observe(containerRef.current);
        // Also observe the child of the container if possible, but observing the container is usually enough for scrollHeight changes?
        // Actually, if content grows, container scrollHeight grows.
    } else {
        resizeObserver.observe(documentElement);
        resizeObserver.observe(document.body);
    }

    // Initial calculation
    updateDimensions();

    const getScrollTop = () => {
       if (target instanceof Window) {
         return target.scrollY;
       } else if (target instanceof HTMLElement) {
         return target.scrollTop;
       }
       return 0;
    };

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const scrollTop = getScrollTop();
          // Use cached value
          const scrollableHeight = maxScrollRef.current;

          if (progressRef.current) {
            // Optimization: If there is no scrollable area, hide the bar
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

    target.addEventListener('scroll', handleScroll, { passive: true });

    // Also listen to window resize as a fallback/redundancy
    window.addEventListener('resize', updateDimensions, { passive: true });

    return () => {
      target.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [containerRef]);

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
