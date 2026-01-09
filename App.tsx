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
 *    - When a user clicks an internal link (e.g., "[Resume]") within the Chat,
 *      the app enters "Split View" mode.
 *    - The Chat Interface shrinks to 50% width on the left.
 *    - The requested content (Resume, Essay) renders in the remaining 50% on the right.
 *    - This allows users to read content while continuing the conversation.
 * 3. **Chat Persistence**:
 *    - The `<ChatInterface />` is **never unmounted**.
 *    - When navigating away from the Chat (e.g., to "Contact"), the Chat container
 *      is hidden using CSS (`display: none` or `opacity: 0`) rather than removed from the DOM.
 *    - "Why": This preserves the conversation history, scroll position, and input state
 *      without needing complex external state management (Redux/Context) for the chat history.
 * 4. **Mobile Responsiveness**:
 *    - On mobile, "Split View" is disabled; navigation is full-page.
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
import { Navbar } from './components/Navbar';
import { ShortcutsModal } from './components/ShortcutsModal';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { X } from 'lucide-react';

const App: React.FC = () => {
  const { currentView, targetEssaySlug, navigateTo } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sideView, setSideView] = useState<View | null>(null);
  const [sideSlug, setSideSlug] = useState<string | undefined>(undefined);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Optimization: Memoize navigation handlers to prevent unnecessary re-renders of
  // ChatInterface (and all ChatMessages) when other state changes (e.g. menus).
  const handleNavigate = React.useCallback((view: View, slug?: string) => {
    // Standard navigation resets side view
    setSideView(null);
    setSideSlug(undefined);
    navigateTo(view, slug);
    setMobileMenuOpen(false);
  }, [navigateTo]);

  const handleChatNavigate = React.useCallback((view: View, slug?: string) => {
    if (window.innerWidth >= 768) { // Desktop
      setSideView(view);
      setSideSlug(slug);
    } else {
      // Mobile: standard navigation
      handleNavigate(view, slug);
    }
  }, [handleNavigate]);

  useGlobalShortcuts({
    // Pass the memoized handler directly to avoid creating a new arrow function on every render
    onNavigate: handleNavigate,
    toggleShortcutsModal: () => setIsShortcutsOpen(prev => !prev),
    isModalOpen: isShortcutsOpen,
  });

  const renderContent = () => {
    const isChatVisible = currentView === View.HOME;

    // We construct a stable layout where ChatInterface is always in the DOM if isChatVisible is true.
    // If sideView is active, we render it side-by-side.
    // If NOT sideView, we render ChatInterface full width (or centered).

    // To avoid remounting ChatInterface, we must use the SAME component instance in the SAME position.

    return (
      <>
        {/* Chat Container */}
        {/* We use a flex container that is always present if Chat is visible */}
        <div className={`flex flex-row h-[calc(100vh-64px)] overflow-hidden transition-all duration-300 ${isChatVisible ? 'opacity-100 pointer-events-auto print:h-auto print:overflow-visible print:block' : 'hidden opacity-0 pointer-events-none'}`}>

           {/* Left Panel (Chat) */}
           {/* If split, w-1/2. If not split, w-full. */}
           <div className={`${sideView ? 'w-1/2 border-r border-slate-800 print:hidden' : 'w-full'} flex flex-col transition-all duration-300 ease-in-out`}>
              {/* Pass handleChatNavigate so internal links trigger split view */}
              <ChatInterface
                  onNavigate={handleChatNavigate}
                  className={sideView ? 'h-full' : undefined}
              />
           </div>

           {/* Right Panel (Side Content) */}
           {/* Only rendered if sideView is active. */}
           {sideView && (
             <div className="w-1/2 relative overflow-y-auto bg-slate-950 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent animate-in slide-in-from-right duration-300 print:w-full print:bg-white print:overflow-visible">
                <button
                    onClick={() => setSideView(null)}
                    className="fixed top-20 right-8 z-50 p-2 bg-slate-900/80 text-slate-400 hover:text-white rounded-full backdrop-blur-md border border-slate-700 shadow-xl transition-all hover:scale-110 print:hidden"
                    title="Close split view"
                    aria-label="Close split view"
                >
                    <X size={20} />
                </button>

                <div className="min-h-full">
                   {sideView === View.ABOUT && <Resume />}
                   {sideView === View.ESSAYS && <Essays initialSlug={sideSlug} isInsideSplitView={true} />}
                </div>
             </div>
           )}
        </div>

        {/* Standard Full Views (When NOT in Chat mode) */}
        {/* Note: If currentView is HOME, we render the above block.
            If currentView is NOT HOME, we render these below.
            Wait, if currentView is NOT HOME, `isChatVisible` is false, so the block above is hidden.
        */}

        {currentView === View.ABOUT && <Resume />}
        {currentView === View.ESSAYS && <Essays initialSlug={targetEssaySlug} />}
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
      {currentView !== View.HOME && <ScrollProgress />}

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
