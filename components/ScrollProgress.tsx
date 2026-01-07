import React, { useEffect, useRef } from 'react';

/**
 * @fileoverview Scroll Progress Bar Component
 *
 * This component displays a horizontal progress bar at the top of the screen (below the navbar)
 * indicating how far the user has scrolled down the page.
 *
 * "Why" / Performance Optimizations:
 * Scroll events fire very frequently (up to hundreds of times per second), and naive implementations
 * that update React state (`useState`) on every event cause massive "Layout Thrashing" and re-renders,
 * leading to janky scrolling on lower-end devices.
 *
 * To achieve 60fps performance, this component employs several optimizations:
 * 1. **Direct DOM Manipulation**: We use a `ref` to update the `style.width` property directly,
 *    bypassing React's Virtual DOM and render cycle entirely for the progress updates.
 * 2. **`requestAnimationFrame`**: We throttle updates to the screen refresh rate, preventing
 *    calculations from blocking the main thread.
 * 3. **`ResizeObserver`**: We monitor the document height efficiently to handle dynamic content loading
 *    without constantly re-querying `document.scrollHeight` (which causes reflows).
 * 4. **Passive Event Listeners**: We use `{ passive: true }` for the scroll listener, telling the
 *    browser that we won't call `preventDefault()`, which allows the compositor thread to scroll
 *    the page immediately without waiting for our JS to run.
 */
export const ScrollProgress: React.FC = () => {
  const progressRef = useRef<HTMLDivElement>(null);
  // Cache the scrollable height to avoid layout thrashing (reading scrollHeight) during scroll events
  const maxScrollRef = useRef<number>(0);

  useEffect(() => {
    let ticking = false;
    let rafId: number;

    // Update dimensions only when necessary (resize/layout change)
    const updateDimensions = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      // Ensure we don't get negative values
      maxScrollRef.current = Math.max(0, documentHeight - windowHeight);
    };

    // Use ResizeObserver to detect content height changes efficiently
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    // Observe both document element (for window resize/zoom) and body (for content changes)
    resizeObserver.observe(document.documentElement);
    resizeObserver.observe(document.body);

    // Initial calculation
    updateDimensions();

    const handleScroll = () => {
      if (!ticking) {
        rafId = window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
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

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Also listen to window resize as a fallback/redundancy
    window.addEventListener('resize', updateDimensions, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
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
