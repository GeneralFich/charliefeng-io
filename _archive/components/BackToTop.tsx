import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

interface BackToTopProps {
  containerRef?: React.RefObject<HTMLDivElement>;
}

export const BackToTop: React.FC<BackToTopProps> = ({ containerRef }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    let rafId: number;

    const getScrollTop = () =>
      containerRef?.current ? containerRef.current.scrollTop : window.scrollY;

    const toggleVisibility = () => {
      if (!ticking) {
        rafId = window.requestAnimationFrame(() => {
          setIsVisible(getScrollTop() > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    const scrollTarget: EventTarget = containerRef?.current ?? window;
    scrollTarget.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    return () => {
      scrollTarget.removeEventListener('scroll', toggleVisibility);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [containerRef]);

  const scrollToTop = () => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (containerRef?.current) {
      containerRef.current.scrollTo({ top: 0, behavior: isReducedMotion ? 'auto' : 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: isReducedMotion ? 'auto' : 'smooth' });
    }

    // Move focus to main content for keyboard users to restore navigation context
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus({ preventScroll: true });
    }
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      className={`fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 z-[100] print:hidden focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
          : 'opacity-0 translate-y-10 pointer-events-none scale-90'
      }`}
    >
      <ArrowUp size={20} />
    </button>
  );
};
