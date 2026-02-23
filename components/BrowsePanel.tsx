import React, { useMemo } from 'react';
import { BookOpen, FileText, ArrowRight, Calendar, Clock } from 'lucide-react';
import { View } from '../types';
import { getPosts } from '../lib/knowledge';
import { useLanguage } from '../lib/i18n/LanguageContext';

interface BrowsePanelProps {
  onNavigate: (view: View, slug?: string, hash?: string) => void;
}

export const BrowsePanel: React.FC<BrowsePanelProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const posts = useMemo(() => getPosts(language), [language]);

  return (
    <div className="max-w-xl mx-auto px-6 py-12 animate-in fade-in duration-500">

      {/* Intro */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold uppercase tracking-widest mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Explore
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
          Browse Charlie's Work
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Read essays and view the full resume — while keeping the conversation going.
        </p>
      </div>

      {/* Essays */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen size={12} />
            Essays
          </h3>
          <button
            onClick={() => onNavigate(View.ESSAYS)}
            className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 uppercase tracking-widest"
          >
            View all <ArrowRight size={10} />
          </button>
        </div>

        <div className="space-y-1">
          {posts.map((post) => (
            <button
              key={post.slug}
              onClick={() => onNavigate(View.ESSAYS, post.slug)}
              className="w-full text-left group flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50 transition-all duration-200"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors truncate leading-snug">
                  {post.attributes.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Calendar size={9} />
                    {new Date(post.attributes.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock size={9} />
                    {post.readTime} min
                  </span>
                </div>
              </div>
              <ArrowRight
                size={13}
                className="text-slate-600 group-hover:text-blue-400 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-slate-800/60 my-6" />

      {/* Resume CTA */}
      <section>
        <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
          <FileText size={12} />
          Resume
        </h3>
        <button
          onClick={() => onNavigate(View.ABOUT)}
          className="w-full group flex items-center justify-between px-4 py-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-blue-500/30 transition-all duration-200"
        >
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
              View Full Resume
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Experience, education, and skills
            </p>
          </div>
          <ArrowRight
            size={15}
            className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0"
          />
        </button>
      </section>

    </div>
  );
};
