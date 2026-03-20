import { useEffect } from 'react';
import { View, Language } from '../types';
import { getPosts } from '../lib/knowledge';

const SITE_NAME = 'Charlie Feng';
const SITE_URL = 'https://charliefeng.io';
const DEFAULT_TITLE = 'Charlie Feng | Infrastructure Product Leader';
const DEFAULT_DESCRIPTION =
  'AI-powered portfolio of Charlie Feng, an Infrastructure Product Leader exploring Product Management, AGI, and Infrastructure.';

function setMetaTag(property: string, content: string) {
  const selector = property.startsWith('og:') || property.startsWith('article:')
    ? `meta[property="${property}"]`
    : `meta[name="${property}"]`;
  const el = document.querySelector(selector) as HTMLMetaElement | null;
  if (el) el.content = content;
}

function setJsonLd(id: string, data: object | null) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = url;
}

/**
 * Updates document title, meta tags, canonical URL, and JSON-LD structured data
 * based on the current view and selected essay.
 */
export function useDocumentHead(
  view: View,
  essaySlug: string | null | undefined,
  language: Language,
) {
  useEffect(() => {
    const posts = getPosts(language);
    const post = essaySlug ? posts.find(p => p.slug === essaySlug) : null;

    let title: string;
    let description: string;
    let canonicalUrl: string;
    let ogType = 'website';

    switch (view) {
      case View.ESSAYS:
        if (post) {
          title = `${post.attributes.title} | ${SITE_NAME}`;
          description = post.attributes.description;
          canonicalUrl = `${SITE_URL}/essays/${post.slug}`;
          ogType = 'article';
        } else {
          title = `Essays | ${SITE_NAME}`;
          description = 'Essays on AGI, AI infrastructure, data centers, and strategic technology leadership by Charlie Feng.';
          canonicalUrl = `${SITE_URL}/essays`;
        }
        break;
      case View.ABOUT:
        title = `Resume — ${SITE_NAME} | Infrastructure Product Leader`;
        description = 'Infrastructure Product Leader with 8+ years of experience at Google and Amazon. Expert in translating hardware engineering and ML constraints into high-leverage software products.';
        canonicalUrl = `${SITE_URL}/about`;
        break;
      default:
        title = DEFAULT_TITLE;
        description = DEFAULT_DESCRIPTION;
        canonicalUrl = SITE_URL;
        break;
    }

    // Update document title
    document.title = title;

    // Update meta tags
    setMetaTag('description', description);
    setMetaTag('og:title', title);
    setMetaTag('og:description', description);
    setMetaTag('og:type', ogType);
    setMetaTag('og:url', canonicalUrl);
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);

    // Update canonical URL
    setCanonical(canonicalUrl);

    // Update JSON-LD structured data
    if (post) {
      // Article schema for essay pages
      setJsonLd('ld-article', {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.attributes.title,
        author: {
          '@type': 'Person',
          name: post.attributes.author,
          url: SITE_URL,
        },
        datePublished: post.attributes.date,
        description: post.attributes.description,
        url: `${SITE_URL}/essays/${post.slug}`,
        publisher: {
          '@type': 'Person',
          name: 'Charlie Feng',
          url: SITE_URL,
        },
      });

      // BreadcrumbList for essay detail
      setJsonLd('ld-breadcrumb', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Essays', item: `${SITE_URL}/essays` },
          { '@type': 'ListItem', position: 3, name: post.attributes.title, item: `${SITE_URL}/essays/${post.slug}` },
        ],
      });
    } else if (view === View.ESSAYS) {
      // BreadcrumbList for essays list
      setJsonLd('ld-article', null);
      setJsonLd('ld-breadcrumb', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Essays', item: `${SITE_URL}/essays` },
        ],
      });
    } else if (view === View.ABOUT) {
      // BreadcrumbList for about page
      setJsonLd('ld-article', null);
      setJsonLd('ld-breadcrumb', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Resume', item: `${SITE_URL}/about` },
        ],
      });
    } else {
      // Homepage — remove article/breadcrumb schemas
      setJsonLd('ld-article', null);
      setJsonLd('ld-breadcrumb', null);
    }
  }, [view, essaySlug, language]);
}
