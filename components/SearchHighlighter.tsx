import React from 'react';
import { escapeRegExp } from '../lib/utils';

// Function to recursively highlight text in React nodes
export const highlightNodes = (nodes: React.ReactNode, query: string): React.ReactNode => {
  if (!query || query.trim() === '') return nodes;

  if (typeof nodes === 'string') {
    const parts = nodes.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
    if (parts.length === 1) return nodes;

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
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
export const Highlighter = ({ children, query, as: Component = 'div', ...props }: { children: React.ReactNode, query: string, as?: any, [key: string]: any }) => {
  const highlighted = highlightNodes(children, query);
  return <Component {...props}>{highlighted}</Component>;
};

// Context to avoid prop drilling and full re-renders of Markdown tree
export const HighlightContext = React.createContext<string>('');

// Context-aware highlighter that doesn't require props from parent
export const SearchHighlighter = ({ children, as: Component = 'div', ...props }: { children: React.ReactNode, as?: any, [key: string]: any }) => {
  const query = React.useContext(HighlightContext);
  const highlighted = highlightNodes(children, query);
  return <Component {...props}>{highlighted}</Component>;
};
