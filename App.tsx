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
import React, { useState } from 'react';
import { View } from './types';
import { useRouter } from './hooks/useRouter';
import { ChatInterface } from './components/ChatInterface';
import { Resume } from './components/Resume';
import { Essays } from './components/Essays';
import { ScrollProgress } from './components/ScrollProgress';
import { BackToTop } from './components/BackToTop';
import { ContactView } from './components/ContactView';
import { Navbar } from './components/Navbar';
import { ShortcutsModal } from './components/ShortcutsModal';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';

const App: React.FC = () => {
  const { currentView, targetEssaySlug, navigateTo } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Optimization: Memoize navigation handlers to prevent unnecessary re-renders of
  // ChatInterface (and all ChatMessages) when other state changes (e.g. menus).
  const handleNavigate = React.useCallback((view: View, slug?: string) => {
    navigateTo(view, slug);
    setMobileMenuOpen(false);
  }, [navigateTo]);

  useGlobalShortcuts({
    // Pass the memoized handler directly to avoid creating a new arrow function on every render
    onNavigate: handleNavigate,
    toggleShortcutsModal: () => setIsShortcutsOpen(prev => !prev),
    isModalOpen: isShortcutsOpen,
  });

  const renderContent = () => {
    const isChatVisible = currentView === View.HOME;

    // We construct a stable layout where ChatInterface is always in the DOM if isChatVisible is true.
    // To avoid remounting ChatInterface, we must use the SAME component instance in the SAME position.

    return (
      <>
        {/* Chat Container */}
        {/* We use a flex container that is always present if Chat is visible */}
        <div className={`flex flex-row h-[calc(100vh-64px)] overflow-hidden transition-all duration-300 ${isChatVisible ? 'opacity-100 pointer-events-auto print:h-auto print:overflow-visible print:block' : 'hidden opacity-0 pointer-events-none'}`}>

           {/* Chat Panel */}
           <div className="w-full flex flex-col transition-all duration-300 ease-in-out">
              <ChatInterface
                  onNavigate={handleNavigate}
              />
           </div>
        </div>

        {currentView === View.ABOUT && <Resume />}
        {currentView === View.ESSAYS && <Essays initialSlug={targetEssaySlug} />}
        {currentView === View.CONTACT && <ContactView />}
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
      {currentView !== View.HOME && currentView !== View.CONTACT && <ScrollProgress />}

      {/* Back to Top Button */}
      {currentView !== View.HOME && <BackToTop />}

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
