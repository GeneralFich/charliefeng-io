import React, { useEffect, useRef } from 'react';

/**
 * @fileoverview Scroll Progress Bar Component
 *
 * Displays a thin gradient bar below the navbar indicating scroll depth,
 * with an animated shimmer sweep for extra energy.
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
          const scrollTop       = getScrollTop();
          const scrollableHeight = maxScrollRef.current;

          if (progressRef.current) {
            if (scrollableHeight <= 0 || scrollTop <= 0) {
              progressRef.current.style.width   = '0%';
              progressRef.current.style.opacity = '0';
            } else {
              const pct = Math.min(100, Math.max(0, (scrollTop / scrollableHeight) * 100));
              progressRef.current.style.width   = `${pct}%`;
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
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [containerRef]);

  return (
    // Outer container: spans only the right panel area on desktop (after the 420px/460px chat sidebar)
    // On mobile it spans the full viewport width
    <div
      className="fixed top-[64px] left-0 lg:left-[420px] xl:left-[460px] right-0 h-[3px] z-50 print:hidden overflow-hidden"
      aria-hidden="true"
    >
      {/* Inner bar: width grows from 0% to 100% of the outer container (= right panel width).
          Styled with the animated blue→indigo→cyan gradient + shimmer sweep. */}
      <div
        ref={progressRef}
        className="h-full overflow-hidden transition-opacity duration-300 ease-in-out"
        style={{
          width: '0%',
          opacity: 0,
          background: 'linear-gradient(90deg, #3b82f6 0%, #818cf8 35%, #22d3ee 65%, #3b82f6 100%)',
          backgroundSize: '200% 100%',
          animation: 'grad-shift 4s linear infinite',
          boxShadow: '0 0 10px rgba(34,211,238,0.4), 0 0 4px rgba(59,130,246,0.6)',
        }}
      >
        {/* Shimmer sweep overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '40%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)',
            animation: 'shimmer-sweep 2.2s linear infinite',
          }}
        />
      </div>
    </div>
  );
};
