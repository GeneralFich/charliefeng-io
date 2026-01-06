import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'charlie-portfolio-bookmarks';

export const useBookmarks = () => {
  // Initialize with empty array to ensure consistent server/client rendering
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load bookmarks', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const toggleBookmark = useCallback((slug: string) => {
    setBookmarks(prev => {
      const newBookmarks = prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [...prev, slug];

      // Update local storage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
      } catch (e) {
        console.error('Failed to save bookmarks', e);
      }

      return newBookmarks;
    });
  }, []);

  const isBookmarked = useCallback((slug: string) => bookmarks.includes(slug), [bookmarks]);

  return { bookmarks, toggleBookmark, isBookmarked, isLoaded };
};
