/**
 * @fileoverview Build-time sitemap.xml generator
 *
 * Generates a sitemap.xml in the dist/ directory containing all crawlable URLs.
 * Run after `vite build` so dist/ exists.
 */

import fs from 'fs';
import path from 'path';
import fm from 'front-matter';

const SITE_URL = 'https://charliefeng.io';
const DIST_DIR = path.join(process.cwd(), 'dist');
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

interface PostFrontMatter {
  title: string;
  date: string;
  author: string;
  description: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(date: string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

function generateSitemap() {
  console.log('Generating sitemap.xml...');

  if (!fs.existsSync(DIST_DIR)) {
    console.error('dist/ directory not found. Run vite build first.');
    process.exit(1);
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));

  // Parse all posts to get slugs and dates
  const enPosts: { slug: string; date: string }[] = [];
  const zhPosts: { slug: string; date: string }[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const parsed = fm<PostFrontMatter>(content);

    if (file.endsWith('.zh.md')) {
      const slug = file.replace('.zh.md', '');
      zhPosts.push({ slug, date: parsed.attributes.date });
    } else {
      const slug = file.replace('.md', '');
      enPosts.push({ slug, date: parsed.attributes.date });
    }
  }

  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Homepage -->
  <url>
    <loc>${escapeXml(SITE_URL)}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- About / Resume -->
  <url>
    <loc>${escapeXml(SITE_URL)}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="zh" href="${escapeXml(SITE_URL)}/zh/about" />
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(SITE_URL)}/about" />
  </url>

  <!-- Chinese About / Resume -->
  <url>
    <loc>${escapeXml(SITE_URL)}/zh/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(SITE_URL)}/about" />
    <xhtml:link rel="alternate" hreflang="zh" href="${escapeXml(SITE_URL)}/zh/about" />
  </url>

  <!-- Essays Index -->
  <url>
    <loc>${escapeXml(SITE_URL)}/essays</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;

  // English essays
  for (const post of enPosts) {
    const zhMatch = zhPosts.find(z => z.slug === post.slug);
    xml += `
  <!-- ${post.slug} -->
  <url>
    <loc>${escapeXml(SITE_URL)}/essays/${escapeXml(post.slug)}</loc>
    <lastmod>${formatDate(post.date)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>${zhMatch ? `
    <xhtml:link rel="alternate" hreflang="zh" href="${escapeXml(SITE_URL)}/zh/essays/${escapeXml(post.slug)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(SITE_URL)}/essays/${escapeXml(post.slug)}" />` : ''}
  </url>`;
  }

  // Chinese essays
  for (const post of zhPosts) {
    const enMatch = enPosts.find(e => e.slug === post.slug);
    xml += `
  <url>
    <loc>${escapeXml(SITE_URL)}/zh/essays/${escapeXml(post.slug)}</loc>
    <lastmod>${formatDate(post.date)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>${enMatch ? `
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(SITE_URL)}/essays/${escapeXml(post.slug)}" />
    <xhtml:link rel="alternate" hreflang="zh" href="${escapeXml(SITE_URL)}/zh/essays/${escapeXml(post.slug)}" />` : ''}
  </url>`;
  }

  xml += `
</urlset>
`;

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xml);
  console.log(`Sitemap generated with ${4 + enPosts.length + zhPosts.length} URLs.`);
}

generateSitemap();
