import { useEffect, useRef } from 'react';
import { View } from '../types';

interface UseGlobalShortcutsProps {
  onNavigate: (view: View) => void;
  toggleShortcutsModal: () => void;
  isModalOpen: boolean;
}

export const useGlobalShortcuts = ({ onNavigate, toggleShortcutsModal, isModalOpen }: UseGlobalShortcutsProps) => {
  const lastKeyTime = useRef<number>(0);
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // If modal is open, only allow ESC (handled in modal) or ? to toggle
      if (isModalOpen) {
          if (event.key === '?' && event.shiftKey) {
             toggleShortcutsModal();
          }
          return;
      }

      // Ignore if user is typing in an input, textarea, or contentEditable
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Help Modal: ? (Shift + /)
      if (event.key === '?' && event.shiftKey) {
        toggleShortcutsModal();
        return;
      }

      const now = Date.now();
      // 1000ms timeout for chord
      const isChord = now - lastKeyTime.current < 1000;

      if (event.key.toLowerCase() === 'g') {
        lastKey.current = 'g';
        lastKeyTime.current = now;
        return;
      }

      if (isChord && lastKey.current === 'g') {
        let navigated = false;
        switch (event.key.toLowerCase()) {
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
            // Reset after successful chord
            lastKey.current = null;
            lastKeyTime.current = 0;
        }
      } else {
        // If they pressed 'g' then waited too long, or pressed something else
        if (lastKey.current) {
             lastKey.current = null;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, toggleShortcutsModal, isModalOpen]);
};
