import { useEffect, useRef } from 'react';
import { View } from '../types';

interface UseGlobalShortcutsProps {
  onNavigate: (view: View) => void;
  toggleShortcutsModal: () => void;
  isModalOpen: boolean;
}

/**
 * @fileoverview Global Keyboard Shortcuts Hook
 *
 * This hook implements a "Chorded" keyboard shortcut system (similar to Gmail, Jira, or Vim)
 * to allow power users to navigate the application without leaving the keyboard.
 *
 * "Why" Chords (Sequence Shortcuts)?
 * Single-key shortcuts (like 'H' for Home) often conflict with normal typing or
 * can be triggered accidentally. Two-key sequences (e.g., press 'G', then 'H')
 * are deliberate actions that are significantly safer to implement globally.
 *
 * Logic:
 * 1. **Leader Key**: Listen for the initial keypress ('G').
 * 2. **Time Window**: Start a 1-second timer.
 * 3. **Follower Key**: If a valid second key ('H', 'A', 'E') is pressed within that window,
 *    trigger the corresponding navigation action.
 * 4. **Safety**: Automatically ignores events when the user is typing in an input field
 *    or content-editable element to prevent disrupting text entry.
 */
export const useGlobalShortcuts = ({ onNavigate, toggleShortcutsModal, isModalOpen }: UseGlobalShortcutsProps) => {
  // Track the last key pressed and when it happened to detect chords
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

      // Safeguard: Ignore if user is typing in an input, textarea, or contentEditable
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
      // 1000ms timeout window to complete the chord
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
