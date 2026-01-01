import React, { useState } from 'react';
import { View } from './types';
import { useRouter } from './hooks/useRouter';
import { ChatInterface } from './components/ChatInterface';
import { Resume } from './components/Resume';
import { Essays } from './components/Essays';
import { ScrollProgress } from './components/ScrollProgress';
import { BackToTop } from './components/BackToTop';
import { ContactView } from './components/ContactView';
import { Logo } from './components/Logo';
import { NavItem } from './components/NavItem';
import { MessageSquare, FileText, Menu, X, BookOpen, Mail } from 'lucide-react';

const App: React.FC = () => {
  const { currentView, targetEssaySlug, navigateTo } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sideView, setSideView] = useState<View | null>(null);
  const [sideSlug, setSideSlug] = useState<string | undefined>(undefined);

  const handleNavigate = (view: View, slug?: string) => {
    // Standard navigation resets side view
    setSideView(null);
    setSideSlug(undefined);
    navigateTo(view, slug);
    setMobileMenuOpen(false);
  };

  const handleChatNavigate = (view: View, slug?: string) => {
    if (window.innerWidth >= 768) { // Desktop
      setSideView(view);
      setSideSlug(slug);
    } else {
      // Mobile: standard navigation
      handleNavigate(view, slug);
    }
  };

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
        <div className={`flex flex-row h-[calc(100vh-64px)] overflow-hidden transition-all duration-300 ${isChatVisible ? 'opacity-100 pointer-events-auto' : 'hidden opacity-0 pointer-events-none'}`}>

           {/* Left Panel (Chat) */}
           {/* If split, w-1/2. If not split, w-full. */}
           <div className={`${sideView ? 'w-1/2 border-r border-slate-800' : 'w-full'} flex flex-col transition-all duration-300 ease-in-out`}>
              {/* Pass handleChatNavigate so internal links trigger split view */}
              <ChatInterface
                  onNavigate={handleChatNavigate}
                  className={sideView ? 'h-full' : undefined}
              />
           </div>

           {/* Right Panel (Side Content) */}
           {/* Only rendered if sideView is active. */}
           {sideView && (
             <div className="w-1/2 relative overflow-y-auto bg-slate-950 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent animate-in slide-in-from-right duration-300">
                <button
                    onClick={() => setSideView(null)}
                    className="fixed top-20 right-8 z-50 p-2 bg-slate-900/80 text-slate-400 hover:text-white rounded-full backdrop-blur-md border border-slate-700 shadow-xl transition-all hover:scale-110"
                    title="Close split view"
                    aria-label="Close split view"
                >
                    <X size={20} />
                </button>

                <div className="min-h-full">
                   {sideView === View.ABOUT && <Resume />}
                   {sideView === View.ESSAYS && <Essays initialSlug={sideSlug} />}
                   {sideView === View.CONTACT && <ContactView />}
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
      <BackToTop />

      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Area */}
            <button
              onClick={() => handleNavigate(View.HOME)}
              className="flex-shrink-0 flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none text-left"
              aria-label="Go to Home"
            >
              <Logo className="w-8 h-8" />
              <div>
                <h1 className="text-white font-bold tracking-tight text-lg">Charlie Feng</h1>
                <div className="group relative cursor-help w-max">
                  <p className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold border-b border-dashed border-blue-400/50">Digital Twin</p>
                  <div className="absolute top-full left-0 mt-2 hidden group-hover:block w-max bg-slate-900/90 backdrop-blur-md text-xs text-slate-300 px-3 py-1.5 rounded border border-slate-700 shadow-xl z-50">
                    Interactive Knowledge Model
                  </div>
                </div>
              </div>
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2">
              <NavItem view={View.HOME} label="Chat" icon={MessageSquare} currentView={currentView} onNavigate={handleNavigate} />
              <NavItem view={View.ABOUT} label="About" icon={FileText} currentView={currentView} onNavigate={handleNavigate} />
              <NavItem view={View.ESSAYS} label="Essays" icon={BookOpen} currentView={currentView} onNavigate={handleNavigate} />
              <div className="h-6 w-px bg-slate-800 mx-2" />
              <NavItem view={View.CONTACT} label="Contact" icon={Mail} currentView={currentView} onNavigate={handleNavigate} />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-400 hover:text-white p-2"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
            <NavItem view={View.HOME} label="Chat" icon={MessageSquare} currentView={currentView} onNavigate={handleNavigate} />
            <NavItem view={View.ABOUT} label="About" icon={FileText} currentView={currentView} onNavigate={handleNavigate} />
            <NavItem view={View.ESSAYS} label="Essays" icon={BookOpen} currentView={currentView} onNavigate={handleNavigate} />
            <NavItem view={View.CONTACT} label="Contact" icon={Mail} currentView={currentView} onNavigate={handleNavigate} />
          </div>
        )}
      </nav>

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
