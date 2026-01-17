import { useState, useEffect, useCallback } from 'react';
import { View } from '../types';
import { parseRoute } from '../lib/route_logic';

/**
 * @fileoverview Custom Router Hook
 *
 * This hook manages the application's "View" state (Home, About, Essays, Contact) and
 * synchronizes it with the browser's URL query parameters.
 *
 * "Why" not React Router?
 * 1. **Persistence:** The application is architected as a "Digital Twin" with a persistent
 *    Chat Interface (Home). When a user navigates to "About" or "Essays", we don't want
 *    to unmount the Chat component (which would lose conversation history). Instead,
 *    we simply overlay other views or show them side-by-side (Split View).
 * 2. **Split View Support:** On desktop, the Chat Interface stays visible on the left
 *    while content opens on the right. Standard routing libraries often assume a
 *    one-route-at-a-time model which makes this "active-but-hidden" or "side-by-side"
 *    state harder to manage without complex nested route configurations.
 * 3. **Simplicity:** For a small portfolio site, a lightweight query-param based router
 *    (`?view=ESSAYS&essay=slug`) is sufficient and easier to deep-link without server-side
 *    rewrite rules for every path.
 */

/**
 * Custom hook to manage navigation state.
 *
 * @returns An object containing:
 * - `currentView`: The active view enum (HOME, ABOUT, ESSAYS, CONTACT).
 * - `targetEssaySlug`: The specific essay slug to display (if in ESSAYS view).
 * - `navigateTo`: Function to programmatically change the view.
 */
export const useRouter = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [targetEssaySlug, setTargetEssaySlug] = useState<string | null>(null);

  /**
   * Navigates to a specific view and optionally sets a sub-resource (slug).
   * Updates the URL query parameters and pushes a new history entry.
   *
   * @param view - The target View.
   * @param slug - Optional slug (e.g., for a specific blog post).
   */
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
      const { view, slug } = parseRoute(params);

      setCurrentView(view);
      setTargetEssaySlug(slug);
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
