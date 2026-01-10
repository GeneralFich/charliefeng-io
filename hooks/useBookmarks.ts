import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'charlie-portfolio-bookmarks';

export function useBookmarks() {
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarkedSlugs(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const toggleBookmark = useCallback((slug: string) => {
    setBookmarkedSlugs(prev => {
      const isBookmarked = prev.includes(slug);
      const newBookmarks = isBookmarked
        ? prev.filter(s => s !== slug)
        : [...prev, slug];

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
      } catch (error) {
        console.error('Failed to save bookmarks:', error);
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
    isBookmarked,
    isInitialized
  };
}
