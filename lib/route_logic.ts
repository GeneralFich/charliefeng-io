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
