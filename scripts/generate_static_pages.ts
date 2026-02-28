/**
 * @fileoverview Build-time static HTML page generator for SEO & LLM crawlability
 *
 * Generates standalone HTML pages for each essay and the about page so that
 * crawlers (Googlebot, GPTBot, ClaudeBot, PerplexityBot) can access full content
 * without executing JavaScript.
 *
 * Each generated page includes:
 * - Full content rendered as HTML from markdown
 * - Proper <title>, <meta description>, <link rel="canonical">
 * - JSON-LD structured data (Article / Person / BreadcrumbList)
 *
 * Pages are written to dist/_seo/ so they don't conflict with the SPA's
 * clean-path routing. Vercel rewrites serve these pages only to crawlers
 * (via user-agent detection), while human visitors get the SPA.
 *
 * Run after `vite build` so dist/ exists.
 */

import fs from 'fs';
import path from 'path';
import fm from 'front-matter';
import { marked } from 'marked';

const SITE_URL = 'https://charliefeng.io';
const SITE_NAME = 'Charlie Feng';
const DIST_DIR = path.join(process.cwd(), 'dist');
const SEO_DIR = path.join(DIST_DIR, '_seo');
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const RESUME_EN = path.join(process.cwd(), 'content', 'resume.md');
const RESUME_ZH = path.join(process.cwd(), 'content', 'resume.zh.md');

interface PostFrontMatter {
  title: string;
  date: string;
  author: string;
  description: string;
}

interface ResumeAttributes {
  name: string;
  title: string;
  location: string;
  summary: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function mkdirp(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Generates a complete HTML page with metadata, content, and structured data.
 * These pages are served only to crawlers — no JS redirect shim is needed.
 */
function buildHtmlPage(opts: {
  title: string;
  description: string;
  canonicalUrl: string;
  contentHtml: string;
  jsonLd: object[];
  lang?: string;
  hreflangAlternate?: { lang: string; url: string };
}): string {
  const { title, description, canonicalUrl, contentHtml, jsonLd, lang = 'en', hreflangAlternate } = opts;

  const jsonLdScripts = jsonLd
    .map(data => `    <script type="application/ld+json">${JSON.stringify(data)}</script>`)
    .join('\n');

  const hreflangLink = hreflangAlternate
    ? `    <link rel="alternate" hreflang="${hreflangAlternate.lang}" href="${hreflangAlternate.url}" />`
    : '';

  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
${hreflangLink}
${jsonLdScripts}
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem 1rem; line-height: 1.7; color: #1e293b; }
      h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #0f172a; }
      h2 { font-size: 1.5rem; margin-top: 2rem; color: #0f172a; }
      h3 { font-size: 1.25rem; margin-top: 1.5rem; color: #0f172a; }
      a { color: #2563eb; }
      .meta { color: #64748b; font-size: 0.875rem; margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; }
      blockquote { border-left: 3px solid #3b82f6; padding-left: 1rem; margin-left: 0; color: #475569; }
      pre { background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
      code { font-size: 0.875rem; }
      img { max-width: 100%; height: auto; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #e2e8f0; padding: 0.5rem; text-align: left; }
      th { background: #f8fafc; }
      nav.breadcrumb { font-size: 0.875rem; color: #64748b; margin-bottom: 1.5rem; }
      nav.breadcrumb a { color: #2563eb; text-decoration: none; }
      nav.breadcrumb a:hover { text-decoration: underline; }
      .spa-notice { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 0.5rem; padding: 0.75rem 1rem; margin-bottom: 1.5rem; font-size: 0.875rem; color: #1e40af; }
      .spa-notice a { color: #1d4ed8; font-weight: 500; }
    </style>
  </head>
  <body>
    <noscript>
      <div class="spa-notice">
        <a href="${SITE_URL}">Visit charliefeng.io</a> for the full interactive experience with AI chat.
      </div>
    </noscript>
${contentHtml}
  </body>
</html>`;
}

/**
 * Generate static HTML pages for all essays.
 */
function generateEssayPages() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));

  let enCount = 0;
  let zhCount = 0;

  for (const file of files) {
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const parsed = fm<PostFrontMatter>(content);

    const isZh = file.endsWith('.zh.md');
    const slug = isZh ? file.replace('.zh.md', '') : file.replace('.md', '');
    const lang = isZh ? 'zh' : 'en';

    // Determine paths
    const urlPath = isZh ? `/zh/essays/${slug}` : `/essays/${slug}`;
    const canonicalUrl = `${SITE_URL}${urlPath}`;
    const title = `${parsed.attributes.title} | ${SITE_NAME}`;
    const description = parsed.attributes.description;

    // Alternate language link
    const alternateLang = isZh ? 'en' : 'zh';
    const alternateUrl = isZh ? `${SITE_URL}/essays/${slug}` : `${SITE_URL}/zh/essays/${slug}`;

    // Check if alternate exists
    const alternateFile = isZh ? `${slug}.md` : `${slug}.zh.md`;
    const hasAlternate = files.includes(alternateFile);

    // Render markdown to HTML
    const htmlContent = marked(parsed.body) as string;

    // Format date
    const dateObj = new Date(parsed.attributes.date);
    const dateStr = dateObj.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    // Build breadcrumb
    const breadcrumb = isZh
      ? `<nav class="breadcrumb"><a href="${SITE_URL}">首页</a> › <a href="${SITE_URL}/essays">文章</a> › ${escapeHtml(parsed.attributes.title)}</nav>`
      : `<nav class="breadcrumb"><a href="${SITE_URL}">Home</a> › <a href="${SITE_URL}/essays">Essays</a> › ${escapeHtml(parsed.attributes.title)}</nav>`;

    // Build content
    const contentHtml = `
    ${breadcrumb}
    <article>
      <header>
        <h1>${escapeHtml(parsed.attributes.title)}</h1>
        <div class="meta">
          <time datetime="${parsed.attributes.date}">${dateStr}</time> · ${escapeHtml(parsed.attributes.author)}
        </div>
      </header>
      ${htmlContent}
    </article>`;

    // JSON-LD
    const jsonLd: object[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: parsed.attributes.title,
        author: { '@type': 'Person', name: parsed.attributes.author, url: SITE_URL },
        datePublished: parsed.attributes.date,
        description: parsed.attributes.description,
        url: canonicalUrl,
        publisher: { '@type': 'Person', name: 'Charlie Feng', url: SITE_URL },
        inLanguage: lang,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Essays', item: `${SITE_URL}/essays` },
          { '@type': 'ListItem', position: 3, name: parsed.attributes.title, item: canonicalUrl },
        ],
      },
    ];

    // Write to _seo/ subdirectory to avoid conflicting with SPA routing
    const outDir = path.join(SEO_DIR, ...(isZh ? ['zh', 'essays', slug] : ['essays', slug]));
    mkdirp(outDir);

    const html = buildHtmlPage({
      title,
      description,
      canonicalUrl,
      contentHtml,
      jsonLd,
      lang,
      hreflangAlternate: hasAlternate ? { lang: alternateLang, url: alternateUrl } : undefined,
    });

    fs.writeFileSync(path.join(outDir, 'index.html'), html);

    if (isZh) zhCount++;
    else enCount++;
  }

  console.log(`Generated ${enCount} English + ${zhCount} Chinese essay pages.`);
}

/**
 * Generate the essays index page.
 */
function generateEssaysIndex() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md') && !f.endsWith('.zh.md'));

  const posts = files.map(file => {
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const parsed = fm<PostFrontMatter>(content);
    const slug = file.replace('.md', '');
    return { slug, ...parsed.attributes };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const listHtml = posts.map(p => {
    const dateStr = new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return `      <li>
        <a href="${SITE_URL}/essays/${p.slug}"><strong>${escapeHtml(p.title)}</strong></a>
        <br /><span style="color: #64748b; font-size: 0.875rem;">${dateStr} · ${escapeHtml(p.description)}</span>
      </li>`;
  }).join('\n');

  const contentHtml = `
    <nav class="breadcrumb"><a href="${SITE_URL}">Home</a> › Essays</nav>
    <h1>Essays</h1>
    <p>Essays on AGI, AI infrastructure, data centers, and strategic technology leadership by Charlie Feng.</p>
    <ul style="list-style: none; padding: 0;">
${listHtml}
    </ul>`;

  const jsonLd: object[] = [{
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Essays', item: `${SITE_URL}/essays` },
    ],
  }];

  const outDir = path.join(SEO_DIR, 'essays');
  mkdirp(outDir);

  const html = buildHtmlPage({
    title: `Essays | ${SITE_NAME}`,
    description: 'Essays on AGI, AI infrastructure, data centers, and strategic technology leadership by Charlie Feng.',
    canonicalUrl: `${SITE_URL}/essays`,
    contentHtml,
    jsonLd,
  });

  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  console.log('Generated essays index page.');
}

/**
 * Generate about/resume pages (EN + ZH).
 */
function generateAboutPages() {
  for (const { file, lang, urlPath } of [
    { file: RESUME_EN, lang: 'en', urlPath: '/about' },
    { file: RESUME_ZH, lang: 'zh', urlPath: '/zh/about' },
  ]) {
    if (!fs.existsSync(file)) {
      console.warn(`Resume file not found: ${file}`);
      continue;
    }

    const content = fs.readFileSync(file, 'utf-8');
    const parsed = fm<ResumeAttributes>(content);

    const canonicalUrl = `${SITE_URL}${urlPath}`;
    const isZh = lang === 'zh';

    const title = isZh
      ? `简历 — ${parsed.attributes.name} | ${parsed.attributes.title}`
      : `Resume — ${parsed.attributes.name} | ${parsed.attributes.title}`;
    const description = parsed.attributes.summary?.slice(0, 200) || `${parsed.attributes.name} — ${parsed.attributes.title}`;

    // Render the body markdown
    const htmlContent = marked(parsed.body || '') as string;

    // Build structured content
    const breadcrumbLabel = isZh ? '简历' : 'Resume';
    const breadcrumb = `<nav class="breadcrumb"><a href="${SITE_URL}">${isZh ? '首页' : 'Home'}</a> › ${breadcrumbLabel}</nav>`;

    const contentHtml = `
    ${breadcrumb}
    <h1>${escapeHtml(parsed.attributes.name)}</h1>
    <p><strong>${escapeHtml(parsed.attributes.title)}</strong> · ${escapeHtml(parsed.attributes.location || '')}</p>
    <p>${escapeHtml(parsed.attributes.summary || '')}</p>
    ${htmlContent}`;

    const jsonLd: object[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: parsed.attributes.name,
        jobTitle: parsed.attributes.title,
        worksFor: { '@type': 'Organization', name: 'Google' },
        url: SITE_URL,
        sameAs: ['https://www.linkedin.com/in/fengcharlie'],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: breadcrumbLabel, item: canonicalUrl },
        ],
      },
    ];

    // Alternate language link
    const alternateLang = isZh ? 'en' : 'zh';
    const alternateUrl = isZh ? `${SITE_URL}/about` : `${SITE_URL}/zh/about`;

    const outDir = path.join(SEO_DIR, ...(isZh ? ['zh', 'about'] : ['about']));
    mkdirp(outDir);

    const html = buildHtmlPage({
      title,
      description,
      canonicalUrl,
      contentHtml,
      jsonLd,
      lang,
      hreflangAlternate: { lang: alternateLang, url: alternateUrl },
    });

    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    console.log(`Generated ${lang} about page.`);
  }
}

// --- Main ---
console.log('Generating static HTML pages for SEO...');

if (!fs.existsSync(DIST_DIR)) {
  console.error('dist/ directory not found. Run `vite build` first.');
  process.exit(1);
}

generateEssayPages();
generateEssaysIndex();
generateAboutPages();

console.log('Static page generation complete.');
