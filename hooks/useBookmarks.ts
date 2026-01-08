import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'charlie-portfolio-bookmarks';

export function useBookmarks() {
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarkedSlugs(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    }
  }, []);

  const toggleBookmark = useCallback((slug: string) => {
    setBookmarkedSlugs(prev => {
      const isBookmarked = prev.includes(slug);
      let newBookmarks;
      if (isBookmarked) {
        newBookmarks = prev.filter(s => s !== slug);
      } else {
        newBookmarks = [...prev, slug];
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
      } catch (err) {
        console.error('Failed to save bookmarks:', err);
      }
      return newBookmarks;
    });
  }, []);

  const isBookmarked = useCallback((slug: string) => {
    return bookmarkedSlugs.includes(slug);
  }, [bookmarkedSlugs]);

  return {
    bookmarkedSlugs,
    toggleBookmark,
    isBookmarked
  };
}
