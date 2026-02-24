/**
 * @fileoverview Root Application Component
 *
 * This component acts as the main Layout Shell and Router for the application.
 * It orchestrates the state-based navigation and the persistence of the Chat Interface.
 *
 * Key Responsibilities:
 * 1. **Routing**: Consumes `useRouter` to determine the current view (`View.HOME`, `View.ABOUT`, etc.).
 * 2. **Split-Panel Layout (desktop lg+)**:
 *    - Left panel: Chat interface — always visible, fixed 420px width.
 *    - Right panel: Content (About/Essays) or BrowsePanel (on HOME view) — fills remaining space.
 *    - Both panels are always in the DOM on desktop; visibility is CSS-controlled.
 * 3. **Chat Persistence**:
 *    - The `<ChatInterface />` is **never unmounted**.
 *    - On mobile, the chat panel uses `display: none` (via Tailwind `hidden`) when not in HOME view,
 *      preserving React state while keeping the DOM clean.
 * 4. **Mobile Responsiveness**:
 *    - Below `lg` breakpoint: full-screen single view (chat or content), unchanged from before.
 */
import React, { useState, useEffect, useRef } from 'react';
import { View } from './types';
import { useRouter } from './hooks/useRouter';
import { useViewTransition } from './hooks/useViewTransition';
import { ChatInterface } from './components/ChatInterface';
import { Resume } from './components/Resume';
import { Essays } from './components/Essays';
import { BrowsePanel } from './components/BrowsePanel';
import { ScrollProgress } from './components/ScrollProgress';
import { BackToTop } from './components/BackToTop';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ParticleBackground } from './components/ParticleBackground';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';

const App: React.FC = () => {
  const { currentView, targetEssaySlug, targetHash, navigateTo } = useRouter();
  const { displayed: displayedView, isExiting, transitionTo, snapTo } = useViewTransition(View.HOME);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Ref to the right content panel — passed to scroll-dependent components so they
  // track the panel's overflow scroll instead of window.scrollY (which never fires
  // on desktop because the panel, not the window, is the scrollable container).
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Ref to expose the chat input focus function. App sets this up once ChatInterface
  // mounts; handleNavigate calls it when the user clicks "Chat" while already on HOME.
  const chatFocusRef = useRef<(() => void) | null>(null);

  // Sync displayedView with the URL-based initial view without animation.
  const isSynced = useRef(false);
  useEffect(() => {
    if (!isSynced.current) {
      isSynced.current = true;
      if (currentView !== View.HOME) snapTo(currentView);
    }
  }, [currentView, snapTo]);

  // Memoized navigation handler — prevents unnecessary re-renders of ChatInterface.
  const handleNavigate = React.useCallback((view: View, slug?: string, hash?: string) => {
    if (view === View.HOME && displayedView === View.HOME && !isExiting) {
      chatFocusRef.current?.();
      return;
    }
    navigateTo(view, slug, hash);
    transitionTo(view);
    rightPanelRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [navigateTo, transitionTo, displayedView, isExiting]);

  useGlobalShortcuts({
    onNavigate: handleNavigate,
    toggleShortcutsModal: () => setIsShortcutsOpen(prev => !prev),
    isModalOpen: isShortcutsOpen,
  });

  const isChatVisible = displayedView === View.HOME;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-50 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-slate-900 dark:via-slate-950 dark:to-black flex flex-col font-sans print:bg-white print:bg-none">

      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-all"
      >
        Skip to content
      </a>

      {/* Animated neural-network particle canvas — replaces the static grid */}
      <ParticleBackground />

      {/* Scroll Progress Bar — tracks right panel scroll on desktop */}
      {displayedView !== View.HOME && <ScrollProgress containerRef={rightPanelRef} />}

      {/* Back to Top Button — scrolls the right panel back to the top on desktop */}
      {displayedView !== View.HOME && <BackToTop containerRef={rightPanelRef} />}

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Main Content — flex row creates the split panel on lg+ screens */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 flex flex-row overflow-hidden relative focus:outline-none print:block print:overflow-visible"
      >
        {/* ── LEFT PANEL: Chat ──────────────────────────────────────────────────────
            Desktop (lg+): Fixed 420px sidebar, always visible, bordered on the right.
            Mobile:        Full-width, visible only when HOME view is active.
            The chat is NEVER unmounted — hidden on mobile via CSS `display:none`
            which preserves React state without opacity/absolute tricks. */}
        <div className={`
          relative flex-shrink-0 flex flex-col
          w-full lg:w-[420px] xl:w-[460px]
          h-[calc(100vh-120px)] md:h-[calc(100vh-64px)]
          border-r border-slate-200 dark:border-slate-800/60
          print:hidden
          ${!isChatVisible ? 'hidden lg:flex' : 'flex'}
        `}>
          <ChatInterface onNavigate={handleNavigate} onFocusRef={chatFocusRef} />
        </div>

        {/* ── RIGHT PANEL: Content ──────────────────────────────────────────────────
            Desktop (lg+): flex-1 scrollable panel, always visible.
              - HOME view  → BrowsePanel (discovery surface)
              - ABOUT view → Resume
              - ESSAYS view → Essays
            Mobile: Full-width, hidden when HOME view is active (chat takes over).
            The transition wrapper inside handles the crossfade between content views. */}
        <div
          ref={rightPanelRef}
          className={`
            flex-1 overflow-y-auto
            h-[calc(100vh-120px)] md:h-[calc(100vh-64px)]
            print:overflow-visible print:h-auto
            ${isChatVisible ? 'hidden lg:block' : 'block'}
          `}
        >
          <div className={`transition-opacity duration-150 min-h-full ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            {displayedView === View.HOME   && <BrowsePanel onNavigate={handleNavigate} />}
            {displayedView === View.ABOUT  && <Resume initialHash={targetHash} isInsideSplitView />}
            {displayedView === View.ESSAYS && (
              <Essays slug={targetEssaySlug} onNavigate={handleNavigate} isInsideSplitView />
            )}
          </div>
        </div>

      </main>

      {/* Mobile bottom tab bar — replaces the hamburger menu on small screens */}
      <MobileBottomNav currentView={currentView} onNavigate={handleNavigate} />

    </div>
  );
};

export default App;
