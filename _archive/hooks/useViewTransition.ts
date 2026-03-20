import { useState, useCallback, useRef, useEffect } from 'react';

const EXIT_DURATION_MS = 150;

/**
 * Manages a two-phase view transition: fade-out → swap content → fade-in.
 *
 * Why: CSS transitions cannot animate elements going from `display:none` to
 * `display:block`. This hook decouples the visual `displayed` value from the
 * logical `target` value, inserting a brief exit window so CSS opacity
 * transitions can complete before the DOM content is swapped.
 *
 * Phase 1 (exit): `isExiting=true` for EXIT_DURATION_MS — caller applies opacity-0.
 * Phase 2 (enter): `displayed` updates to new value, `isExiting=false` — incoming
 *   content mounts and fades in via its own animate-in classes.
 */
export function useViewTransition<T>(initial: T) {
  const [displayed, setDisplayed] = useState<T>(initial);
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef<T>(initial);

  /** Animated two-phase transition. No-op if already transitioning to this value. */
  const transitionTo = useCallback((next: T) => {
    if (next === latestRef.current) return;
    latestRef.current = next;

    if (timerRef.current) clearTimeout(timerRef.current);

    setIsExiting(true);
    timerRef.current = setTimeout(() => {
      setDisplayed(next);
      setIsExiting(false);
      timerRef.current = null;
    }, EXIT_DURATION_MS);
  }, []);

  /** Instant swap with no animation — used for initial URL-based load. */
  const snapTo = useCallback((next: T) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    latestRef.current = next;
    setDisplayed(next);
    setIsExiting(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { displayed, isExiting, transitionTo, snapTo };
}
