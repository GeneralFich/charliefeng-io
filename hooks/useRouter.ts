import { useState, useEffect, useCallback } from 'react';
import { View } from '../types';
import { parseRoute, buildNavigationUrl } from '../lib/route_logic';

/**
 * @fileoverview Custom Router Hook
 *
 * This hook manages the application's "View" state (Home, About, Essays) and
 * synchronizes it with the browser's URL pathname using clean path-based routing.
 *
 * URL format: /about, /essays, /essays/my-slug, /essays/my-slug#heading-id
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
 * 3. **Simplicity:** For a small portfolio site, a lightweight path-based custom router
 *    is sufficient and keeps the bundle size minimal.
 */

/**
 * Custom hook to manage navigation state.
 *
 * @returns An object containing:
 * - `currentView`: The active view enum (HOME, ABOUT, ESSAYS).
 * - `targetEssaySlug`: The specific essay slug to display (if in ESSAYS view).
 * - `targetHash`: The target hash anchor for deep linking.
 * - `navigateTo`: Function to programmatically change the view.
 */
export const useRouter = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [targetEssaySlug, setTargetEssaySlug] = useState<string | null>(null);
  const [targetHash, setTargetHash] = useState<string | null>(null);

  /**
   * Navigates to a specific view and optionally sets a sub-resource (slug) and hash.
   * Updates the URL pathname and pushes a new history entry.
   *
   * @param view - The target View.
   * @param slug - Optional slug (e.g., for a specific blog post).
   * @param hash - Optional hash anchor (e.g., #section-id).
   */
  const navigateTo = useCallback((view: View, slug?: string, hash?: string) => {
    setCurrentView(view);
    if (view === View.ESSAYS && slug) {
      setTargetEssaySlug(slug);
    } else {
      setTargetEssaySlug(null);
    }

    setTargetHash(hash || null);

    // Update URL with clean path
    const newUrl = buildNavigationUrl(view, slug, hash);
    window.history.pushState({ view, slug, hash }, '', newUrl);
  }, []);

  // Initialize from URL on mount and handle back/forward navigation
  useEffect(() => {
    const syncFromUrl = () => {
      // Backward compatibility: detect old query-param format (?view=ESSAYS&essay=slug)
      // and silently rewrite to the clean path equivalent.
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (viewParam && Object.values(View).includes(viewParam as View)) {
        const view = viewParam as View;
        const essayParam = params.get('essay');
        const slug = (view === View.ESSAYS && essayParam) ? essayParam : undefined;
        const hash = window.location.hash || undefined;
        const newUrl = buildNavigationUrl(view, slug, hash);
        window.history.replaceState({ view, slug, hash }, '', newUrl);
        setCurrentView(view);
        setTargetEssaySlug(slug || null);
        setTargetHash(hash || null);
        return;
      }

      // Parse clean path
      const { view, slug } = parseRoute(window.location.pathname);
      const hash = window.location.hash;

      setCurrentView(view);
      setTargetEssaySlug(slug);
      setTargetHash(hash || null);
    };

    // Initial sync
    syncFromUrl();

    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  return {
    currentView,
    targetEssaySlug,
    targetHash,
    navigateTo
  };
};
