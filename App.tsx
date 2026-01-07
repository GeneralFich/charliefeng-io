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
import { ContactView } from './components/ContactView';
import { Navbar } from './components/Navbar';
import { ShortcutsModal } from './components/ShortcutsModal';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { X, MessageSquare } from 'lucide-react';

const App: React.FC = () => {
  const { currentView, targetEssaySlug, navigateTo } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const handleNavigate = (view: View, slug?: string) => {
    navigateTo(view, slug);
    setMobileMenuOpen(false);

    // On mobile, close chat when navigating so the new content is visible.
    // We check window width to determine if we are in mobile layout (< 768px).
    if (window.innerWidth < 768) {
      setIsChatOpen(false);
    }
  };

  useGlobalShortcuts({
    onNavigate: (view) => handleNavigate(view),
    toggleShortcutsModal: () => setIsShortcutsOpen(prev => !prev),
    isModalOpen: isShortcutsOpen,
  });

  const renderContent = () => {
    // Desktop: Push layout
    // Chat takes 50% width on the RIGHT when open.
    // Content takes 50% width on the LEFT when chat is open, 100% when closed.

    // Mobile: Overlay layout
    // Content always 100%. Chat is fixed overlay.

    return (
      <div className="flex flex-row h-[calc(100vh-64px)] overflow-hidden relative">
         {/* Main Content Area */}
         <div className={`
             flex-col transition-all duration-300 ease-in-out h-full overflow-y-auto bg-slate-950 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent print:w-full print:bg-white print:overflow-visible
             ${isChatOpen ? 'hidden md:flex md:w-1/2 border-r border-slate-800' : 'flex w-full'}
         `}>
             <div className="min-h-full relative">
                {(currentView === View.HOME || currentView === View.ABOUT) && <Resume />}
                {currentView === View.ESSAYS && <Essays initialSlug={targetEssaySlug} />}
                {currentView === View.CONTACT && <ContactView />}
             </div>
         </div>

         {/* Chat Sidebar (Right side on desktop, Full screen on mobile) */}
         <div className={`
            transition-all duration-300 ease-in-out bg-slate-950/95 backdrop-blur-sm border-l border-slate-800 overflow-hidden
            fixed inset-0 top-16 z-40 md:static md:z-auto md:h-full
            ${isChatOpen ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible pointer-events-none md:w-0 md:border-l-0'}
            ${isChatOpen ? 'md:w-1/2' : ''}
         `}>
            {/* Close Button for Mobile/Desktop */}
            <button
                onClick={() => setIsChatOpen(false)}
                className="absolute top-4 right-4 z-50 p-2 bg-slate-900/80 text-slate-400 hover:text-white rounded-full backdrop-blur-md border border-slate-700 shadow-xl transition-all hover:scale-110 md:hidden"
                title="Close chat"
                aria-label="Close chat"
            >
                <X size={20} />
            </button>

            <div className="h-full w-full flex flex-col">
              {/* Pass navigateTo directly.
                  Note: In the new model, navigating from chat just changes the content on the left.
              */}
              <ChatInterface
                  onNavigate={handleNavigate}
                  className="h-full"
                  context={`User is currently viewing the ${currentView} page${targetEssaySlug ? ` (Slug: ${targetEssaySlug})` : ''}.`}
              />
            </div>
         </div>
      </div>
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
      <BackToTop />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
      />

      {/* Mobile Chat Toggle FAB */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`md:hidden fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          isChatOpen
            ? 'bg-slate-800 text-slate-400 border border-slate-700'
            : 'bg-blue-600 text-white shadow-blue-500/30'
        }`}
        aria-label={isChatOpen ? "Close chat" : "Open chat"}
      >
        {isChatOpen ? <X size={24} /> : <MessageSquare size={24} fill="currentColor" />}
      </button>

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
