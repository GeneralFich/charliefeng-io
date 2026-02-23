/**
 * @fileoverview Root Application Component
 *
 * This component acts as the main Layout Shell and Router for the application.
 * It orchestrates the state-based navigation and the persistence of the Chat Interface.
 *
 * Key Responsibilities:
 * 1. **Routing**: Consumes `useRouter` to determine the current view (`View.HOME`, `View.ABOUT`, etc.).
 * 2. **Chat Persistence**:
 *    - The `<ChatInterface />` is **never unmounted**.
 *    - When navigating away from the Chat (e.g., to "Contact"), the Chat container
 *      is hidden using CSS (`display: none` or `opacity: 0`) rather than removed from the DOM.
 *    - "Why": This preserves the conversation history, scroll position, and input state
 *      without needing complex external state management (Redux/Context) for the chat history.
 * 3. **Mobile Responsiveness**:
 *    - Navigation is full-page.
 *    - Includes a collapsible navigation drawer.
 */
import React, { useState, useEffect, useRef } from 'react';
import { View } from './types';
import { useRouter } from './hooks/useRouter';
import { useViewTransition } from './hooks/useViewTransition';
import { ChatInterface } from './components/ChatInterface';
import { Resume } from './components/Resume';
import { Essays } from './components/Essays';
import { ScrollProgress } from './components/ScrollProgress';
import { BackToTop } from './components/BackToTop';
import { Navbar } from './components/Navbar';
import { ShortcutsModal } from './components/ShortcutsModal';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';

const App: React.FC = () => {
  const { currentView, targetEssaySlug, targetHash, navigateTo } = useRouter();
  const { displayed: displayedView, isExiting, transitionTo, snapTo } = useViewTransition(View.HOME);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Sync displayedView with the URL-based initial view without animation.
  // Why: useRouter reads URL params in a useEffect (async), so currentView starts as
  // HOME then updates to the URL value. snapTo handles this one-time sync instantly.
  const isSynced = useRef(false);
  useEffect(() => {
    if (!isSynced.current) {
      isSynced.current = true;
      if (currentView !== View.HOME) snapTo(currentView);
    }
  }, [currentView, snapTo]);

  // Optimization: Memoize navigation handlers to prevent unnecessary re-renders of
  // ChatInterface (and all ChatMessages) when other state changes (e.g. menus).
  const handleNavigate = React.useCallback((view: View, slug?: string, hash?: string) => {
    navigateTo(view, slug, hash); // Update URL + router state immediately
    transitionTo(view);           // Animate the visual transition (150ms fade-out delay)
    setMobileMenuOpen(false);
  }, [navigateTo, transitionTo]);

  useGlobalShortcuts({
    // Pass the memoized handler directly to avoid creating a new arrow function on every render
    onNavigate: handleNavigate,
    toggleShortcutsModal: () => setIsShortcutsOpen(prev => !prev),
    isModalOpen: isShortcutsOpen,
  });

  const renderContent = () => {
    // Use displayedView (not currentView) for rendering decisions so content only
    // swaps after the exit animation completes, giving a smooth crossfade effect.
    const isChatVisible = displayedView === View.HOME;

    return (
      <>
        {/* Chat Container — always in the DOM to preserve conversation state.
            Uses absolute positioning (not `hidden`) when invisible so that
            CSS opacity transitions can animate. The -z-10 keeps it behind
            other views during the crossfade. */}
        <div className={`flex flex-row h-[calc(100vh-64px)] overflow-hidden transition-opacity duration-300 print:h-auto print:overflow-visible print:block ${
          isChatVisible
            ? 'opacity-100 pointer-events-auto'
            : 'absolute inset-0 -z-10 opacity-0 pointer-events-none'
        }`}>
          <div className="w-full flex flex-col">
            <ChatInterface onNavigate={handleNavigate} />
          </div>
        </div>

        {/* Non-chat views — the wrapper's opacity handles the exit fade (150ms),
            and each component's own animate-in classes handle the entry fade. */}
        {!isChatVisible && (
          <div className={`transition-opacity duration-150 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            {displayedView === View.ABOUT && <Resume initialHash={targetHash} />}
            {displayedView === View.ESSAYS && (
              <Essays slug={targetEssaySlug} onNavigate={handleNavigate} />
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex flex-col font-sans print:bg-white print:bg-none">
      
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all"
      >
        Skip to content
      </a>

      {/* Scroll Progress Bar */}
      {displayedView !== View.HOME && <ScrollProgress />}

      {/* Back to Top Button */}
      {displayedView !== View.HOME && <BackToTop />}

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 relative print:overflow-visible focus:outline-none"
      >
        {/* Subtle Background Grid Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] print:hidden"
             style={{
               backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
               backgroundSize: '40px 40px'
             }}
        />
        
        {renderContent()}
      </main>

    </div>
  );
};

export default App;
