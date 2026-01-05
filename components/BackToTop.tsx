import React, { useEffect, useState, RefObject } from 'react';
import { ArrowUp } from 'lucide-react';

interface BackToTopProps {
  containerRef?: RefObject<HTMLElement | null>;
}

export const BackToTop: React.FC<BackToTopProps> = ({ containerRef }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    let rafId: number;

    const target = containerRef?.current || window;
    // When using window, we check scrollY. When using element, we check scrollTop.
    const getScrollTop = () => {
       if (target instanceof Window) {
         return target.scrollY;
       } else if (target instanceof HTMLElement) {
         return target.scrollTop;
       }
       return 0;
    };

    const toggleVisibility = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          if (getScrollTop() > 300) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    target.addEventListener('scroll', toggleVisibility, { passive: true });
    // Check initial scroll position
    toggleVisibility();

    return () => {
      target.removeEventListener('scroll', toggleVisibility);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [containerRef]); // Re-run if ref changes

  const scrollToTop = () => {
    const target = containerRef?.current || window;
    target.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      className={`fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 z-[100] print:hidden focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
          : 'opacity-0 translate-y-10 pointer-events-none scale-90'
      }`}
    >
      <ArrowUp size={20} />
    </button>
  );
};
