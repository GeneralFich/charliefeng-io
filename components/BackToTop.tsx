import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    // Check initial scroll position
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // We use CSS for visibility transition to keep the component mounted if needed,
  // or just conditionally render. Conditional rendering is simpler for accessibility (removes from DOM).
  // But we want a fade out effect.
  // Tailwind `transition-opacity` works well with `opacity-0` vs `opacity-100`.
  // However, removing from DOM when hidden prevents interaction.
  // Let's use conditional rendering with animation classes.

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 z-50 print:hidden animate-in fade-in slide-in-from-bottom-8 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
    >
      <ArrowUp size={20} />
    </button>
  );
};
