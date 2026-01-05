import { useEffect, useRef } from 'react';
import { View } from '../types';

interface UseGlobalShortcutsProps {
  onNavigate: (view: View) => void;
  toggleShortcuts: () => void;
  isShortcutsOpen: boolean;
}

export const useGlobalShortcuts = ({ onNavigate, toggleShortcuts, isShortcutsOpen }: UseGlobalShortcutsProps) => {
  // Use refs for state that doesn't need to trigger re-renders
  const lastKeyRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focused on input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Handle Escape for modal closing
      if (e.key === 'Escape' && isShortcutsOpen) {
        toggleShortcuts();
        return;
      }

      // Handle '?' to toggle modal (Shift + /)
      if (e.key === '?') {
        e.preventDefault();
        toggleShortcuts();
        return;
      }

      const key = e.key.toLowerCase();

      // Handle 'G' sequence state
      if (key === 'g') {
        if (lastKeyRef.current === 'g') {
            // Reset if g is pressed again (optional)
        } else {
            lastKeyRef.current = 'g';
            // Clear sequence after 1s
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                lastKeyRef.current = null;
            }, 1000);
        }
        return;
      }

      // Handle second key in sequence if 'g' was pressed
      if (lastKeyRef.current === 'g') {
        let navigated = false;

        switch (key) {
          case 'h':
            onNavigate(View.HOME);
            navigated = true;
            break;
          case 'a':
            onNavigate(View.ABOUT);
            navigated = true;
            break;
          case 'e':
            onNavigate(View.ESSAYS);
            navigated = true;
            break;
          case 'c':
            onNavigate(View.CONTACT);
            navigated = true;
            break;
        }

        if (navigated) {
          lastKeyRef.current = null;
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [onNavigate, toggleShortcuts, isShortcutsOpen]); // Removed lastKeyRef from deps

  return {};
};
