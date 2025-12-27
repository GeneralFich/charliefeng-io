import React from 'react';
import { escapeRegExp } from '../lib/utils';

/**
 * @fileoverview Recursive React Node Highlighter
 *
 * "Why": When using `react-markdown`, the output is a tree of React components
 * (e.g., `<h1>`, `<strong>`, `<a>`). We want to highlight search matches *inside*
 * these components without breaking their structure or functionality.
 *
 * A simple string replacement (`text.replace`) on the raw markdown source is risky because:
 * 1. It might break Markdown syntax (e.g. highlighting text inside a URL).
 * 2. It might break HTML structure if `react-markdown` is configured to allow HTML.
 *
 * "How": This module implements a recursive traversal of the React Virtual DOM (nodes).
 * 1. It walks down the tree of React Nodes.
 * 2. If it finds a string, it splits it by the search query and wraps matches in `<mark>`.
 * 3. If it finds a Component/Element, it clones it and recursively processes its `children`.
 * 4. It preserves all other props (event handlers, styles, classes).
 *
 * This allows us to inject `<mark>` tags deeply nested within other components
 * (like bold text inside a link inside a paragraph) while keeping the UI interactive.
 */

/**
 * Recursively traverses a React Node tree and highlights text matching the query.
 *
 * @param nodes - The React Node(s) to process. Can be a string, an array, or a React Element.
 * @param query - The search string to highlight.
 * @returns A new React Node tree with text matches wrapped in `<mark>` tags.
 */
export const highlightNodes = (nodes: React.ReactNode, query: string): React.ReactNode => {
  if (!query || query.trim() === '') return nodes;

  // Case 1: Text Node (Leaf)
  if (typeof nodes === 'string') {
    const parts = nodes.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
    if (parts.length === 1) return nodes;

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className="bg-yellow-500/50 text-white rounded-sm px-0.5">{part}</mark>
        : part
    );
  }

  // Case 2: Array of Nodes (Fragment)
  if (Array.isArray(nodes)) {
    return nodes.map((node, i) => <React.Fragment key={i}>{highlightNodes(node, query)}</React.Fragment>);
  }

  // Case 3: React Element (Branch)
  if (React.isValidElement(nodes)) {
    // We must cast to `any` here because `props` is read-only on ReactElement
    // and generic traversal makes it hard to know specific prop types.
    // We are only modifying `children`, so this is generally safe.
    return React.cloneElement(nodes as React.ReactElement<any>, {
      children: highlightNodes((nodes.props as any).children, query)
    });
  }

  return nodes;
};

/**
 * A wrapper component that highlights its children based on a query.
 * useful for highlighting arbitrary blocks of UI.
 */
export const Highlighter = ({ children, query, as: Component = 'div', ...props }: { children: React.ReactNode, query: string, as?: any, [key: string]: any }) => {
  const highlighted = highlightNodes(children, query);
  return <Component {...props}>{highlighted}</Component>;
};

// Context to avoid prop drilling the search query through every level of the Markdown tree.
// `components/Essays.tsx` provides this context.
export const HighlightContext = React.createContext<string>('');

/**
 * A context-aware highlighter component designed for use within `react-markdown` custom renderers.
 * It automatically picks up the current search query from `HighlightContext`.
 *
 * usage in `react-markdown`:
 * components={{
 *   p: ({ node, ...props }) => <SearchHighlighter as="p" {...props} />
 * }}
 */
export const SearchHighlighter = ({ children, as: Component = 'div', ...props }: { children: React.ReactNode, as?: any, [key: string]: any }) => {
  const query = React.useContext(HighlightContext);
  const highlighted = highlightNodes(children, query);
  return <Component {...props}>{highlighted}</Component>;
};
