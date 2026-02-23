import React, { useEffect, useRef } from 'react';

/**
 * @fileoverview Scroll Progress Bar Component
 *
 * Displays a horizontal progress bar below the navbar indicating scroll depth.
 *
 * Performance optimizations:
 * 1. Direct DOM manipulation via ref (no React state updates on scroll)
 * 2. requestAnimationFrame throttling for 60fps
 * 3. ResizeObserver for efficient height tracking
 * 4. Passive event listeners
 *
 * In split-panel layout, an optional `containerRef` tracks a scrollable div
 * (the right content panel) instead of the window. The bar is then positioned
 * to span only the right panel width (starting after the chat sidebar).
 */

interface ScrollProgressProps {
  containerRef?: React.RefObject<HTMLDivElement>;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({ containerRef }) => {
  // progressRef points to the inner bar div that grows in width
  const progressRef = useRef<HTMLDivElement>(null);
  // Cache the scrollable height to avoid layout thrashing during scroll events
  const maxScrollRef = useRef<number>(0);

  useEffect(() => {
    let ticking = false;
    let rafId: number;

    const getScrollTop = () =>
      containerRef?.current ? containerRef.current.scrollTop : window.scrollY;

    const updateDimensions = () => {
      if (containerRef?.current) {
        const el = containerRef.current;
        maxScrollRef.current = Math.max(0, el.scrollHeight - el.clientHeight);
      } else {
        maxScrollRef.current = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef?.current) {
      resizeObserver.observe(containerRef.current);
    } else {
      resizeObserver.observe(document.documentElement);
      resizeObserver.observe(document.body);
    }

    updateDimensions();

    const handleScroll = () => {
      if (!ticking) {
        rafId = window.requestAnimationFrame(() => {
          const scrollTop = getScrollTop();
          const scrollableHeight = maxScrollRef.current;

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

    const scrollTarget: EventTarget = containerRef?.current ?? window;
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });

    if (!containerRef?.current) {
      window.addEventListener('resize', updateDimensions, { passive: true });
    }

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
      if (!containerRef?.current) {
        window.removeEventListener('resize', updateDimensions);
      }
      resizeObserver.disconnect();
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [containerRef]);

  return (
    // Outer container: spans only the right panel area on desktop (after the 420px/460px chat sidebar)
    // On mobile it spans the full viewport width
    <div
      className="fixed top-[64px] left-0 lg:left-[420px] xl:left-[460px] right-0 h-1 z-50 print:hidden overflow-hidden"
      aria-hidden="true"
    >
      {/* Inner bar: width grows from 0% to 100% of the outer container (= right panel width) */}
      <div
        ref={progressRef}
        className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6] transition-opacity duration-300 ease-in-out overflow-hidden"
        style={{ width: '0%', opacity: 0 }}
      >
        <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-blue-300 to-transparent shadow-[0_0_15px_#60a5fa]"></div>
      </div>
    </div>
  );
};
