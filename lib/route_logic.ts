import { View } from '../types';

/**
 * Parses the current route state from the URL pathname.
 *
 * @param pathname - The pathname string (e.g. window.location.pathname).
 * @returns An object containing the resolved View and optional essay slug.
 */
export function parseRoute(pathname: string): { view: View; slug: string | null } {
  // Normalize: strip trailing slashes and optional /zh language prefix
  const path = (pathname.replace(/\/+$/, '') || '/').replace(/^\/zh/, '') || '/';

  if (path === '/') return { view: View.HOME, slug: null };
  if (path === '/about') return { view: View.ABOUT, slug: null };
  if (path === '/dashboard') return { view: View.DASHBOARD, slug: null };
  if (path === '/essays') return { view: View.ESSAYS, slug: null };

  if (path.startsWith('/essays/')) {
    const slug = path.slice('/essays/'.length);
    if (slug) return { view: View.ESSAYS, slug };
  }

  // Default to Home for unknown paths
  return { view: View.HOME, slug: null };
}

/**
 * Builds a clean navigation URL from view, slug, and hash parameters.
 *
 * @param view - The target View.
 * @param slug - Optional essay slug.
 * @param hash - Optional hash anchor (with or without leading #).
 * @returns The fully constructed URL path string.
 */
export function buildNavigationUrl(
  view: View,
  slug?: string,
  hash?: string,
): string {
  let path: string;

  switch (view) {
    case View.ABOUT:
      path = '/about';
      break;
    case View.DASHBOARD:
      path = '/dashboard';
      break;
    case View.ESSAYS:
      path = slug ? `/essays/${slug}` : '/essays';
      break;
    case View.HOME:
    default:
      path = '/';
      break;
  }

  if (hash) {
    const cleanHash = hash.startsWith('#') ? hash : `#${hash}`;
    path += cleanHash;
  }

  return path;
}
