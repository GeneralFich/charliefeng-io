import React from 'react';
import { escapeRegExp } from '../lib/utils';

// Function to recursively highlight text in React nodes
export const highlightNodes = (nodes: React.ReactNode, query: string | RegExp | null): React.ReactNode => {
  if (!query) return nodes;

  // Handle string query: convert to RegExp or return early if empty
  let regex: RegExp;
  if (typeof query === 'string') {
    if (query.trim() === '') return nodes;
    regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  } else {
    regex = query;
  }

  if (typeof nodes === 'string') {
    const parts = nodes.split(regex);
    if (parts.length === 1) return nodes;

    // When splitting with a capturing group (regex), matches are at odd indices
    return parts.map((part, i) =>
      i % 2 === 1
        ? <mark key={i} className="bg-yellow-500/50 text-white rounded-sm px-0.5">{part}</mark>
        : part
    );
  }

  if (Array.isArray(nodes)) {
    return nodes.map((node, i) => <React.Fragment key={i}>{highlightNodes(node, query)}</React.Fragment>);
  }

  if (React.isValidElement(nodes)) {
    return React.cloneElement(nodes as React.ReactElement<any>, {
      children: highlightNodes((nodes.props as any).children, query)
    });
  }

  return nodes;
};

// Component wrapper to apply highlighting
export const Highlighter = ({ children, query, as: Component = 'div', ...props }: { children: React.ReactNode, query: string | RegExp, as?: any, [key: string]: any }) => {
  const highlighted = highlightNodes(children, query);
  return <Component {...props}>{highlighted}</Component>;
};

// Context to avoid prop drilling and full re-renders of Markdown tree
export const HighlightContext = React.createContext<RegExp | null>(null);

// Context-aware highlighter that doesn't require props from parent
export const SearchHighlighter = ({ children, as: Component = 'div', ...props }: { children: React.ReactNode, as?: any, [key: string]: any }) => {
  const query = React.useContext(HighlightContext);
  const highlighted = highlightNodes(children, query);
  return <Component {...props}>{highlighted}</Component>;
};
