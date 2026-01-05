/**
 * @fileoverview Root Application Component
 *
 * This component acts as the main Layout Shell and Router for the application.
 * It orchestrates the state-based navigation, split-view layout logic, and
 * the persistence of the Chat Interface.
 *
 * Key Responsibilities:
 * 1. **Routing**: Consumes `useRouter` to determine the current view (`View.HOME`, `View.ABOUT`, etc.).
 * 2. **Split View Architecture (Desktop)**:
 *    - The application uses a persistent split-view layout on desktop.
 *    - Left Panel: Chat Interface (Always visible, 50% width).
 *    - Right Panel: Content Area (Resume, Essays, Contact) (Always visible, 50% width).
 *    - The "About" page is effectively merged into the Chat page's default state.
 * 3. **Chat Persistence**:
 *    - The `<ChatInterface />` is **never unmounted**.
 *    - On mobile, it's hidden via CSS when navigating to other views.
 *    - On desktop, it remains visible on the left side.
 * 4. **Mobile Responsiveness**:
 *    - On mobile, "Split View" is disabled; navigation is full-page (stacked).
 *    - `View.HOME` shows Chat. Other views show their respective content.
 */
import React, { useState, useRef } from 'react';
import { View } from './types';
import { useRouter } from './hooks/useRouter';
import { ChatInterface } from './components/ChatInterface';
import { Resume } from './components/Resume';
import { Essays } from './components/Essays';
import { ScrollProgress } from './components/ScrollProgress';
import { BackToTop } from './components/BackToTop';
import { ContactView } from './components/ContactView';
import { Navbar } from './components/Navbar';

const App: React.FC = () => {
  const { currentView, targetEssaySlug, navigateTo } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Unified navigation handler
  const handleNavigate = (view: View, slug?: string) => {
    navigateTo(view, slug);
    setMobileMenuOpen(false);
    // Reset scroll of right panel on navigation
    if (rightPanelRef.current) {
        rightPanelRef.current.scrollTop = 0;
    }
  };

  // Determine what to show in the Right Panel (Content)
  const getRightPanelContent = () => {
    switch (currentView) {
      case View.HOME:
        // Default right panel content is Resume (About)
        return <Resume />;
      case View.ABOUT:
        return <Resume />;
      case View.ESSAYS:
        return <Essays initialSlug={targetEssaySlug || undefined} />;
      case View.CONTACT:
        return <ContactView />;
      default:
        return <Resume />;
    }
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

      {/* Scroll Progress Bar
          Tracks the right panel scroll on desktop, or window on mobile if we were using window scroll.
          But here, the right panel is the scrollable area in both cases (except HOME mobile).
          Wait, on Mobile Home, Chat scrolls internally.
          On Mobile Other, Right Panel scrolls internally.
          So we pass rightPanelRef. If currentView is HOME (Mobile), rightPanel is hidden, so no progress. Correct.
      */}
      <ScrollProgress containerRef={rightPanelRef} />

      {/* Back to Top Button */}
      <BackToTop containerRef={rightPanelRef} />

      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 relative focus:outline-none flex flex-row h-[calc(100vh-64px)] overflow-hidden"
      >
        {/* Subtle Background Grid Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] print:hidden"
             style={{
               backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
               backgroundSize: '40px 40px'
             }}
        />

        {/* Left Panel: Chat Interface */}
        {/*
            Desktop: Always visible (md:flex md:w-1/2)
            Mobile: Visible ONLY if currentView is HOME (w-full)
        */}
        <div className={`
            flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 print:hidden
            ${currentView === View.HOME ? 'w-full md:w-1/2 flex' : 'hidden md:flex md:w-1/2'}
        `}>
             <ChatInterface onNavigate={handleNavigate} className="h-full" />
        </div>

        {/* Right Panel: Content */}
        {/*
            Desktop: Always visible (md:block md:w-1/2)
            Mobile: Visible ONLY if currentView is NOT HOME (w-full)
        */}
        <div
            ref={rightPanelRef}
            className={`
            relative overflow-y-auto bg-slate-950 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent
            ${currentView === View.HOME ? 'hidden md:block md:w-1/2' : 'w-full md:w-1/2 block'}
             print:w-full print:bg-white print:overflow-visible
        `}>
            <div className="min-h-full">
                {getRightPanelContent()}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
