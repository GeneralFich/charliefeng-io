import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    let rafId: number;

    const toggleVisibility = () => {
      if (!ticking) {
        rafId = window.requestAnimationFrame(() => {
          // Show button when page is scrolled down 300px
          if (window.scrollY > 300) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    // Check initial scroll position
    toggleVisibility();

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    // Move focus to main content to prevent focus loss when button disappears
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      // Use preventScroll: true because we are already handling the scroll visually
      mainContent.focus({ preventScroll: true });
    }
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
