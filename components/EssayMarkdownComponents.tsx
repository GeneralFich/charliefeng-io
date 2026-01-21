import React from 'react';
import type { Components } from 'react-markdown';
import { SearchHighlighter } from './SearchHighlighter';
import { isSafeLink } from '../lib/utils';
import { CodeBlock } from './CodeBlock';
import { Heading } from './Heading';
import { WhitepaperCharts } from './WhitepaperCharts';
import { WhitepaperSummary } from './WhitepaperSummary';

/**
 * Configuration for "Infographic" code blocks.
 * Maps the language identifier (e.g. `whitepaper-summary`) to either a React component
 * or a specific iframe height configuration.
 */
interface InfographicConfig {
  component?: React.ComponentType;
  iframeHeight?: string;
}

const INFOGRAPHIC_CONFIG: Record<string, InfographicConfig> = {
  'whitepaper-summary': { component: WhitepaperSummary },
  'whitepaper-charts': { component: WhitepaperCharts },
  'collision': { iframeHeight: "h-[600px] md:h-[300px]" },
  'leverage': { iframeHeight: "h-[450px]" },
  'strategy': { iframeHeight: "h-[400px]" },
  'mechanics': { iframeHeight: "h-[400px]" },
};

/**
 * @fileoverview Custom Markdown Components Mapping
 *
 * This module defines how Markdown elements are rendered in the Essay view.
 * It implements two critical patterns to support rich, interactive content
 * within standard Markdown files:
 *
 * 1. **Component Hijack Pattern**:
 *    We use specific code block languages (e.g., `infographic`, `whitepaper-charts`)
 *    as "triggers" to render complex React components instead of raw code.
 *    This allows authors to embed interactive charts and iframes by simply writing
 *    a code block in the Markdown source.
 *
 * 2. **Unwrap Pattern**:
 *    Standard Markdown parsers wrap code blocks in `<pre><code>...</code></pre>`.
 *    When we hijack the `code` element to render a `div` (like a chart),
 *    this results in invalid HTML (`<pre><div>...</div></pre>`).
 *    We intercept the `pre` element to "unwrap" these hijacked components,
 *    rendering them directly without the parent `<pre>`.
 */
export const ESSAY_MARKDOWN_COMPONENTS: Components = {
  // Custom Anchor to handle footnotes and external links
  a: ({ node, href, children, ...props }: any) => {
    // Security: Prevent XSS and open redirects
    const safeHref = href || '';
    if (!isSafeLink(safeHref)) {
      return <span {...props} className="text-slate-400 cursor-not-allowed" title="Link disabled">{children}</span>;
    }

    const isInternal = safeHref.startsWith('#');
    const handleClick = (e: React.MouseEvent) => {
      if (isInternal && safeHref) {
        e.preventDefault();
        const id = safeHref.slice(1);
        let el = document.getElementById(id);
        // Fallback for double-prefixed IDs (remark-gfm + rehype-sanitize conflict)
        if (!el) {
          el = document.getElementById(`user-content-${id}`);
        }
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    return (
      <a
        href={safeHref}
        onClick={handleClick}
        className={`text-blue-400 hover:text-blue-300 transition-colors break-words [overflow-wrap:anywhere] ${!isInternal ? 'no-underline border-b border-blue-400/30 hover:border-blue-300' : ''}`}
        target={isInternal ? undefined : "_blank"}
        rel={isInternal ? undefined : "noopener noreferrer"}
        {...props}
      >
        {children}
      </a>
    );
  },
  // Apply context-aware highlighter to text blocks and auto-generated IDs
  h1: (props: any) => <Heading level="h1" className="text-2xl font-bold text-white mt-12 mb-6" {...props} />,
  h2: (props: any) => <Heading level="h2" className="text-xl font-bold text-slate-200 mt-10 mb-4" {...props} />,
  h3: (props: any) => <Heading level="h3" className="text-lg font-bold text-slate-200 mt-8 mb-3" {...props} />,
  p: ({ node, children, ...props }: any) => <SearchHighlighter as="p" className="text-slate-300 leading-relaxed mb-6" {...props}>{children}</SearchHighlighter>,
  li: ({ node, children, ...props }: any) => <SearchHighlighter as="li" className="text-slate-300" {...props}>{children}</SearchHighlighter>,
  blockquote: ({ node, children, ...props }: any) => (
    <blockquote {...props} className="border-l-4 border-blue-500/50 pl-4 italic text-slate-400 my-8">
      <SearchHighlighter>{children}</SearchHighlighter>
    </blockquote>
  ),
  /**
   * Unwrap Pattern:
   * Intercepts the `<pre>` tag. If the child `<code>` block is flagged as an
   * infographic (hijacked component), we return the children directly (Fragment).
   * This removes the `<pre>` wrapper, preventing invalid HTML (`<pre><div>...`)
   * and allowing the component to render with full block-level styling.
   */
  pre: ({ node, children, ...props }: any) => {
    // Check for infographic in children
    const codeChild = node.children && node.children.length > 0 ? node.children[0] : null;
    const className = codeChild && codeChild.properties ? (codeChild.properties.className || []) : [];
    const classList = Array.isArray(className) ? className : [className];
    const isInfographic = classList.some((c: string) => c.includes('language-infographic'));

    if (isInfographic) {
      return <>{children}</>;
    }

    return <CodeBlock node={node} {...props}>{children}</CodeBlock>;
  },
  /**
   * Component Hijack Pattern:
   * Intercepts `<code>` blocks with specific language tags (e.g. `language-infographic`).
   * Instead of rendering code, it renders specific interactive components or iframes.
   *
   * @example
   * ```infographic
   * whitepaper-charts
   * ```
   * Renders the <WhitepaperCharts /> component.
   */
  code: ({ node, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const isInfographic = match && match[1] === 'infographic';

    if (isInfographic) {
      const type = String(children).replace(/\n$/, '').trim();
      const config = INFOGRAPHIC_CONFIG[type];

      if (config?.component) {
        const Component = config.component;
        return <Component />;
      }

      // Standard Iframe Infographics
      const src = `/infographics/thermodynamic-wall/${type}.html`;
      const heightClass = config?.iframeHeight || "h-[400px]";

      return (
        <div className="my-8 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
          <iframe
            src={src}
            className={`w-full ${heightClass}`}
            style={{ border: 'none' }}
            title={`Infographic: ${type}`}
            loading="lazy"
          />
        </div>
      );
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};
