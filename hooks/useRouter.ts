import { useState, useEffect, useCallback } from 'react';
import { View } from '../types';

export const useRouter = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [targetEssaySlug, setTargetEssaySlug] = useState<string | null>(null);

  // Handle URL updates and browser history
  const navigateTo = useCallback((view: View, slug?: string) => {
    setCurrentView(view);
    if (view === View.ESSAYS && slug) {
      setTargetEssaySlug(slug);
    } else {
      setTargetEssaySlug(null);
    }

    // Update URL
    const params = new URLSearchParams();
    params.set('view', view);
    if (slug) {
      params.set('essay', slug);
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ view, slug }, '', newUrl);
  }, []);

  // Initialize from URL on mount and handle back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      const essayParam = params.get('essay');

      if (viewParam && Object.values(View).includes(viewParam as View)) {
        setCurrentView(viewParam as View);
        if (viewParam === View.ESSAYS && essayParam) {
          setTargetEssaySlug(essayParam);
        } else {
          setTargetEssaySlug(null);
        }
      } else {
        // Default to Home if no valid view param
        setCurrentView(View.HOME);
        setTargetEssaySlug(null);
      }
    };

    // Initial check
    handlePopState();

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return {
    currentView,
    targetEssaySlug,
    navigateTo
  };
};
