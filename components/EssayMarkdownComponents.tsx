import React from 'react';
import type { Components } from 'react-markdown';
import { SearchHighlighter } from './SearchHighlighter';
import { isSafeLink } from '../lib/utils';
import { CodeBlock } from './CodeBlock';
import { Heading } from './Heading';
import { WhitepaperCharts } from './WhitepaperCharts';
import { WhitepaperSummary } from './WhitepaperSummary';

/**
 * @fileoverview Markdown Component Registry & Custom Renderers
 *
 * "Why": This file acts as the bridge between raw Markdown text (from `content/posts/*.md`)
 * and the React UI. It tells `react-markdown` how to render specific HTML elements.
 *
 * Key Feature: "The Component Hijack Pattern"
 * To render complex, interactive React components (like Charts or Dashboards) inside a static Markdown file,
 * we use a convention where a standard code block with a specific language tag is intercepted and replaced
 * with a React component.
 *
 * Example in Markdown:
 * ```infographic
 * whitepaper-charts
 * ```
 *
 * How it works:
 * 1. `react-markdown` parses the block as a `<pre>` containing a `<code>` element.
 * 2. Our custom `pre` renderer checks if the inner `code` has the class `language-infographic`.
 * 3. If yes, it "unwraps" the content (removes the `<pre>` tag) to avoid invalid HTML nesting.
 * 4. Our custom `code` renderer sees `language-infographic` and reads the text content ("whitepaper-charts").
 * 5. It switches on that text ID to render the corresponding React component (`<WhitepaperCharts />`).
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
  pre: ({ node, children, ...props }: any) => {
    // "Unwrap Pattern":
    // Standard Markdown renders code blocks as <pre><code>...</code></pre>.
    // If we want to replace the code block with a div-based React component (like a Chart),
    // we must NOT wrap it in a <pre>, as <div> inside <pre> is valid but <pre> adds unwanted styling
    // (whitespace preservation, fonts) that breaks the custom component's layout.

    // 1. Peek at the children to see if it's a code block with our magic tag.
    const codeChild = node.children && node.children.length > 0 ? node.children[0] : null;
    const className = codeChild && codeChild.properties ? (codeChild.properties.className || []) : [];
    const classList = Array.isArray(className) ? className : [className];
    const isInfographic = classList.some((c: string) => c.includes('language-infographic'));

    // 2. If it's a hijacked component, return the children directly (bypassing <pre>).
    // The `code` component below will handle the actual rendering.
    if (isInfographic) {
      return <>{children}</>;
    }

    // 3. Otherwise, render a standard CodeBlock.
    return <CodeBlock node={node} {...props}>{children}</CodeBlock>;
  },
  code: ({ node, className, children, ...props }: any) => {
    // Extract the language tag (e.g., "language-infographic" -> "infographic")
    const match = /language-(\w+)/.exec(className || '');
    const isInfographic = match && match[1] === 'infographic';

    if (isInfographic) {
      // The content of the code block serves as the ID for the component we want to render.
      // e.g. "whitepaper-charts"
      const type = String(children).replace(/\n$/, '').trim();

      // --- Component Switchboard ---

      // Handle Whitepaper Summary
      if (type === 'whitepaper-summary') {
        return <WhitepaperSummary />;
      }

      // Handle Whitepaper Charts
      if (type === 'whitepaper-charts') {
        return <WhitepaperCharts />;
      }

      // Standard Iframe Infographics (Legacy/External)
      const src = `/infographics/thermodynamic-wall/${type}.html`;

      // Define heights based on type
      let heightClass = "h-[400px]"; // Default

      if (type === 'collision') {
        heightClass = "h-[600px] md:h-[300px]";
      } else if (type === 'leverage') {
        heightClass = "h-[450px]";
      } else if (type === 'strategy') {
        heightClass = "h-[400px]";
      } else if (type === 'mechanics') {
        heightClass = "h-[400px]";
      }

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

    // Default: Render a standard inline code element
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};
