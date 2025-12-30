import React, { useState, useEffect } from 'react';
import { View } from './types';
import { ChatInterface } from './components/ChatInterface';
import { Resume } from './components/Resume';
import { Essays } from './components/Essays';
import { ScrollProgress } from './components/ScrollProgress';
import { BackToTop } from './components/BackToTop';
import { ContactView } from './components/ContactView';
import { Logo } from './components/Logo';
import { NavItem } from './components/NavItem';
import { LayoutGrid, MessageSquare, FileText, ExternalLink, Menu, X, LineChart, BookOpen, Mail } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [targetEssaySlug, setTargetEssaySlug] = useState<string | null>(null);

  // Handle URL updates and browser history
  const handleNavigate = React.useCallback((view: View, slug?: string) => {
    setCurrentView(view);
    if (view === View.ESSAYS && slug) {
      setTargetEssaySlug(slug);
    } else {
      setTargetEssaySlug(null);
    }
    setMobileMenuOpen(false);

    // Update URL
    const params = new URLSearchParams();
    params.set('view', view);
    if (slug) {
      params.set('essay', slug);
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ view, slug }, '', newUrl);
  }, []);

  // Initialize from URL on mount and handle back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      const essayParam = params.get('essay');

      if (viewParam && Object.values(View).includes(viewParam as View)) {
        setCurrentView(viewParam as View);
        if (viewParam === View.ESSAYS && essayParam) {
          setTargetEssaySlug(essayParam);
        } else {
          setTargetEssaySlug(null);
        }
      } else {
        // Default to Home if no valid view param
        setCurrentView(View.HOME);
        setTargetEssaySlug(null);
      }
    };

    // Initial check
    handlePopState();

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderContent = () => {
    // We keep ChatInterface mounted to persist history and state
    const isChatVisible = currentView === View.HOME;

    return (
      <>
        <div className={isChatVisible ? 'block h-full' : 'hidden'}>
          <ChatInterface onNavigate={handleNavigate} />
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
