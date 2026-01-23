import React, { useState, useRef, useMemo, useEffect } from 'react';
import { escapeRegExp } from '../lib/utils';

interface UseArticleSearchReturn {
  articleSearchQuery: string;
  setArticleSearchQuery: (query: string) => void;
  currentMatchIndex: number;
  totalMatches: number;
  articleSearchInputRef: React.RefObject<HTMLInputElement>;
  articleSearchRegex: RegExp | null;
  handleNextMatch: () => void;
  handlePrevMatch: () => void;
}

/**
 * Custom hook to manage in-article search logic.
 *
 * Why: This abstracts the search state, regex creation, DOM matching,
 * scrolling, and keyboard shortcuts from the presentation component.
 * It follows the "Separation of Concerns" principle, allowing the
 * EssayDetail component to focus on rendering.
 */
export const useArticleSearch = (slug: string): UseArticleSearchReturn => {
  const [articleSearchQuery, setArticleSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [totalMatches, setTotalMatches] = useState(0);
  const articleSearchInputRef = useRef<HTMLInputElement>(null);

  // Create regex for article search (memoized)
  const articleSearchRegex = useMemo(() => {
    if (!articleSearchQuery.trim()) return null;
    try {
      return new RegExp(`(${escapeRegExp(articleSearchQuery)})`, 'gi');
    } catch {
      return null;
    }
  }, [articleSearchQuery]);

  const matchElementsRef = useRef<NodeListOf<HTMLElement> | []>([]);
  const prevMatchIndexRef = useRef<number>(-1);

  // Handle Search Logic: Find and store all matches.
  useEffect(() => {
    if (!articleSearchQuery.trim()) {
      setTotalMatches(0);
      setCurrentMatchIndex(-1);
      matchElementsRef.current = [];
      return;
    }

    // Defer DOM query to allow for <mark> tags to be rendered by highlighter
    const timer = setTimeout(() => {
      const marks = document.querySelectorAll('article mark') as NodeListOf<HTMLElement>;
      matchElementsRef.current = marks;
      setTotalMatches(marks.length);

      if (marks.length > 0) {
        setCurrentMatchIndex(0);
      } else {
        setCurrentMatchIndex(-1);
      }
      // Reset previous index on new search
      prevMatchIndexRef.current = -1;
    }, 150);

    return () => clearTimeout(timer);
  }, [articleSearchQuery, slug]);

  // Handle Match Navigation Styling & Scrolling
  useEffect(() => {
    const marks = matchElementsRef.current;
    if (marks.length === 0) return;

    const prevIndex = prevMatchIndexRef.current;
    const currentIndex = currentMatchIndex;

    // De-highlight the previous match
    if (prevIndex >= 0 && prevIndex < marks.length && prevIndex !== currentIndex) {
      const prevMark = marks[prevIndex];
      if (prevMark) {
        prevMark.className = "bg-yellow-500/50 text-white rounded-sm px-0.5 transition-colors duration-300";
      }
    }

    // Highlight and scroll to the active match
    if (currentIndex >= 0 && currentIndex < marks.length) {
      const activeMark = marks[currentIndex];
      if (activeMark) {
        activeMark.className = "bg-orange-500 text-white rounded-sm px-0.5 ring-2 ring-orange-400 shadow-lg shadow-orange-500/20 z-10 relative transition-all duration-300";
        activeMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Update ref for the next render cycle
    prevMatchIndexRef.current = currentIndex;
  }, [currentMatchIndex]);

  const handleNextMatch = () => {
    if (totalMatches === 0) return;
    setCurrentMatchIndex(prev => (prev + 1) % totalMatches);
  };

  const handlePrevMatch = () => {
    if (totalMatches === 0) return;
    setCurrentMatchIndex(prev => (prev - 1 + totalMatches) % totalMatches);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        articleSearchInputRef.current?.focus();
      }

      // Escape to blur input
      if (e.key === 'Escape') {
        if (document.activeElement === articleSearchInputRef.current) {
          articleSearchInputRef.current?.blur();
        }
      }

      // Enter to go to next match if focused
      if (e.key === 'Enter' && document.activeElement === articleSearchInputRef.current) {
        e.preventDefault();
        if (e.shiftKey) {
          handlePrevMatch();
        } else {
          handleNextMatch();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalMatches]); // Re-bind when match count changes to capture latest state closure

  return {
    articleSearchQuery,
    setArticleSearchQuery,
    currentMatchIndex,
    totalMatches,
    articleSearchInputRef,
    articleSearchRegex,
    handleNextMatch,
    handlePrevMatch
  };
};
