import React from 'react';

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
 * Recursively traverses a React Node tree and highlights text matching the regex.
 *
 * Strategy:
 * 1. String: Split by regex and wrap matches in `<mark>`.
 * 2. Array: Recursively map over each item.
 * 3. Element: Clone the element and recursively highlight its `children` prop.
 * 4. Other (null, boolean, number): Return as is.
 *
 * @param nodes - The React Node(s) to traverse (string, array, or element).
 * @param regex - The regex to highlight (must have a capturing group for split to work).
 * @returns A new React Node tree with highlights applied.
 */
export const highlightNodes = (nodes: React.ReactNode, regex: RegExp | null): React.ReactNode => {
  if (!regex) return nodes;

  // Case 1: Text Node (Leaf)
  if (typeof nodes === 'string') {
    // Split text by the regex
    // Note: The regex MUST have a capturing group `(...)` for split to include the delimiters (matches).
    const parts = nodes.split(regex);

    // If no match, return original string to save memory
    if (parts.length === 1) return nodes;

    // Map parts to elements, wrapping matches
    // With `split(/(group)/)`, odd indices are matches.
    return parts.map((part, i) =>
      (i % 2 === 1)
        ? <mark key={i} className="bg-yellow-500/50 text-white rounded-sm px-0.5">{part}</mark>
        : part
    );
  }

  // Case 2: Array of Nodes (Fragment contents)
  if (Array.isArray(nodes)) {
    const newNodes = nodes.map(node => highlightNodes(node, regex));

    // Optimization: Check for referential equality.
    // If no children changed, return the original array to avoid re-renders.
    if (newNodes.every((n, i) => n === nodes[i])) {
      return nodes;
    }

    // Return the new array directly.
    // Previous implementation wrapped each item in a Fragment, which was unnecessary overhead.
    // React handles arrays of nodes natively.
    return newNodes;
  }

  // Case 3: React Element (div, span, p, custom component)
  if (React.isValidElement(nodes)) {
    const originalChildren = (nodes.props as any).children;
    const newChildren = highlightNodes(originalChildren, regex);

    // Optimization: If children didn't change (referential equality),
    // return the original node to prevent unnecessary cloning and re-rendering.
    if (newChildren === originalChildren) {
      return nodes;
    }

    // Clone the element to preserve its type and props (className, style, etc.)
    // but replace its `children` with the highlighted version.
    return React.cloneElement(nodes as React.ReactElement<any>, {
      children: newChildren
    });
  }

  // Case 4: Primitives we don't touch (number, boolean, null)
  return nodes;
};

/**
 * A wrapper component that applies highlighting to its children.
 * Useful for simple blocks of text where you want to pass the query explicitly.
 *
 * @param regex - The regex to search for.
 * @param as - The HTML tag or Component to render as the container (default: 'div').
 */
export const Highlighter = ({ children, regex, as: Component = 'div', ...props }: { children: React.ReactNode, regex: RegExp | null, as?: any, [key: string]: any }) => {
  const highlighted = highlightNodes(children, regex);
  return <Component {...props}>{highlighted}</Component>;
};

/**
 * Context to share the search regex deep into the component tree.
 *
 * "Why": In `react-markdown`, we customize components like `p`, `li`, `h1`.
 * Passing the search query as a prop to every single one of these would require
 * prop-drilling through the Markdown renderer (which is hard/impossible) or
 * recreating the component definition on every render (performance killer).
 *
 * Solution: The parent `Essays` component provides the regex via Context,
 * and the leaf components (h1, p) consume it only when they render.
 */
export const HighlightContext = React.createContext<RegExp | null>(null);

/**
 * A Context-aware highlighter.
 * automatically picks up the `regex` from `HighlightContext`.
 *
 * usage in react-markdown:
 * ```tsx
 * components={{
 *   p: ({node, children, ...props}) => <SearchHighlighter as="p" {...props}>{children}</SearchHighlighter>
 * }}
 * ```
 */
export const SearchHighlighter = ({ children, as: Component = 'div', ...props }: { children: React.ReactNode, as?: any, [key: string]: any }) => {
  const regex = React.useContext(HighlightContext);
  const highlighted = highlightNodes(children, regex);
  return <Component {...props}>{highlighted}</Component>;
};
