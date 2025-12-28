import React from 'react';
import { escapeRegExp } from '../lib/utils';

/**
 * @fileoverview Recursive Text Highlighting for React Trees
 *
 * "Why": When rendering Markdown (via `react-markdown`), we get a complex tree of React components (p, h1, strong, etc.).
 * Standard string replacement (`text.replace`) destroys this structure, removing bold/italic formatting and breaking layout.
 *
 * This module provides a way to "walk" the Virtual DOM tree, find text nodes that match a search query,
 * and wrap *only those text nodes* in a `<mark>` tag, while preserving all other React components and props.
 *
 * It is used primarily in the `Essays` component to implement "Ctrl+F" style search highlighting within articles.
 */

/**
 * Recursively traverses a React Node tree and highlights text matching the query.
 *
 * Strategy:
 * 1. String: Split by query regex and wrap matches in `<mark>`.
 * 2. Array: Recursively map over each item.
 * 3. Element: Clone the element and recursively highlight its `children` prop.
 * 4. Other (null, boolean, number): Return as is.
 *
 * @param nodes - The React Node(s) to traverse (string, array, or element).
 * @param query - The search string to highlight.
 * @returns A new React Node tree with highlights applied.
 */
export const highlightNodes = (nodes: React.ReactNode, query: string): React.ReactNode => {
  if (!query || query.trim() === '') return nodes;

  // Case 1: Text Node (Leaf)
  if (typeof nodes === 'string') {
    // Split text by the query (case-insensitive)
    const parts = nodes.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));

    // If no match, return original string to save memory
    if (parts.length === 1) return nodes;

    // Map parts to elements, wrapping matches
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className="bg-yellow-500/50 text-white rounded-sm px-0.5">{part}</mark>
        : part
    );
  }

  // Case 2: Array of Nodes (Fragment contents)
  if (Array.isArray(nodes)) {
    return nodes.map((node, i) => <React.Fragment key={i}>{highlightNodes(node, query)}</React.Fragment>);
  }

  // Case 3: React Element (div, span, p, custom component)
  if (React.isValidElement(nodes)) {
    // Clone the element to preserve its type and props (className, style, etc.)
    // but replace its `children` with the highlighted version.
    return React.cloneElement(nodes as React.ReactElement<any>, {
      children: highlightNodes((nodes.props as any).children, query)
    });
  }

  // Case 4: Primitives we don't touch (number, boolean, null)
  return nodes;
};

/**
 * A wrapper component that applies highlighting to its children.
 * Useful for simple blocks of text where you want to pass the query explicitly.
 *
 * @param query - The text to search for.
 * @param as - The HTML tag or Component to render as the container (default: 'div').
 */
export const Highlighter = ({ children, query, as: Component = 'div', ...props }: { children: React.ReactNode, query: string, as?: any, [key: string]: any }) => {
  const highlighted = highlightNodes(children, query);
  return <Component {...props}>{highlighted}</Component>;
};

/**
 * Context to share the search query deep into the component tree.
 *
 * "Why": In `react-markdown`, we customize components like `p`, `li`, `h1`.
 * Passing the search query as a prop to every single one of these would require
 * prop-drilling through the Markdown renderer (which is hard/impossible) or
 * recreating the component definition on every render (performance killer).
 *
 * Solution: The parent `Essays` component provides the query via Context,
 * and the leaf components (h1, p) consume it only when they render.
 */
export const HighlightContext = React.createContext<string>('');

/**
 * A Context-aware highlighter.
 * automatically picks up the `query` from `HighlightContext`.
 *
 * usage in react-markdown:
 * ```tsx
 * components={{
 *   p: ({node, children, ...props}) => <SearchHighlighter as="p" {...props}>{children}</SearchHighlighter>
 * }}
 * ```
 */
export const SearchHighlighter = ({ children, as: Component = 'div', ...props }: { children: React.ReactNode, as?: any, [key: string]: any }) => {
  const query = React.useContext(HighlightContext);
  const highlighted = highlightNodes(children, query);
  return <Component {...props}>{highlighted}</Component>;
};
