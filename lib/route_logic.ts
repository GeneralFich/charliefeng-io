import { View } from '../types';

/**
 * Parses the current route state from URL search parameters.
 *
 * @param params - The URLSearchParams object (e.g. from window.location.search).
 * @returns An object containing the resolved View and optional essay slug.
 */
export function parseRoute(params: URLSearchParams): { view: View; slug: string | null } {
  const viewParam = params.get('view');
  const essayParam = params.get('essay');

  if (viewParam && Object.values(View).includes(viewParam as View)) {
    const view = viewParam as View;
    if (view === View.ESSAYS && essayParam) {
      return { view, slug: essayParam };
    } else {
      return { view, slug: null };
    }
  } else {
    // Default to Home if no valid view param
    return { view: View.HOME, slug: null };
  }
}

/**
 * Builds a navigation URL from view, slug, and hash parameters.
 * Extracted from useRouter.navigateTo() for testability.
 *
 * @param pathname - The base pathname (e.g. "/").
 * @param view - The target View.
 * @param slug - Optional essay slug.
 * @param hash - Optional hash anchor (with or without leading #).
 * @returns The fully constructed URL string.
 */
export function buildNavigationUrl(
  pathname: string,
  view: View,
  slug?: string,
  hash?: string,
): string {
  const params = new URLSearchParams();
  params.set('view', view);
  if (slug) {
    params.set('essay', slug);
  }
  let url = `${pathname}?${params.toString()}`;
  if (hash) {
    const cleanHash = hash.startsWith('#') ? hash : `#${hash}`;
    url += cleanHash;
  }
  return url;
}
