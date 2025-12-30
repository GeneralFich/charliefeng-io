import React from 'react';
import { Linkedin } from 'lucide-react';
import { ContactForm } from './ContactForm';
import { LINKEDIN_URL } from '../lib/knowledge';

export const ContactView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Contact</h2>
        <p className="text-slate-400 text-lg mb-6">
          Get in touch for collaborations, speaking engagements, or just to say hello.
        </p>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Linkedin size={20} />
          <span>Connect on LinkedIn</span>
        </a>
      </div>
      <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6 md:p-8">
        <ContactForm />
      </div>
    </div>
  );
};
