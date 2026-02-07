import React, { useState, useEffect } from 'react';
import { Download, MapPin, Briefcase, GraduationCap, Users, Share2, Check, Linkedin } from 'lucide-react';
import { getResumeAttributes, LINKEDIN_URL } from '../lib/knowledge';
import { View } from '../types';
import { slugify } from '../lib/utils';
import { useLanguage } from '../lib/i18n/LanguageContext';

interface ResumeProps {
  initialHash?: string | null;
}

export const Resume: React.FC<ResumeProps> = ({ initialHash }) => {
  const { t, language } = useLanguage();
  const { name, location, summary, experience, education, leadership, skills } = getResumeAttributes(language);
  const [isCopied, setIsCopied] = useState(false);

  // Handle hash scrolling on mount or update
  // We use window.location.hash directly as a fallback, but listening to hash changes or remounts is key.
  // Since Resume is mounted when view=ABOUT, it should run this effect.
  useEffect(() => {
    const scrollToHash = () => {
        const hashToUse = initialHash || window.location.hash;
        if (hashToUse) {
          const id = hashToUse.replace(/^#/, '');
          // Try to find the element
          const element = document.getElementById(id);
          if (element) {
            // Add a small delay to ensure rendering is complete
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Add a temporary highlight effect
                element.classList.add('bg-blue-900/20', 'transition-colors', 'duration-1000');
                setTimeout(() => {
                    element.classList.remove('bg-blue-900/20');
                }, 2000);
            }, 100);
          }
        }
    };

    scrollToHash();

    // Also listen for hash changes if the user clicks another anchor link while on the page
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, [initialHash, language]); // Re-run if language changes (DOM re-renders)

  const handleShare = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', View.ABOUT);
      await navigator.clipboard.writeText(url.toString());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 animate-fade-in text-slate-300 print:text-black print:p-0 print:max-w-none">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:border-slate-300 print:mb-4 print:pb-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2 !print:text-black">{name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400 print:text-slate-600">
             <span className="flex items-center gap-1 cursor-default"><MapPin size={14} /> {location}</span>
          </div>
        </div>

        <div className="flex gap-3 print:hidden">
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 hover:border-blue-500/50 hover:text-blue-400 text-slate-400 rounded-lg transition-all text-sm"
            title={t.actions.viewLinkedin}
            aria-label={t.actions.viewLinkedin}
          >
            <Linkedin size={16} />
            <span>LinkedIn</span>
          </a>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 hover:border-blue-500/50 hover:text-blue-400 text-slate-400 rounded-lg transition-all text-sm group"
            title={t.actions.share}
            aria-label={isCopied ? t.actions.copied : t.actions.share}
          >
            {isCopied ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
            <span className={isCopied ? 'text-green-400' : ''}>{isCopied ? t.actions.copied : t.actions.share}</span>
          </button>

          <button
            onClick={() => window.print()}
            title={t.actions.downloadPdf}
            aria-label={t.actions.downloadPdf}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 hover:border-blue-500/50 hover:text-blue-400 text-slate-400 rounded-lg transition-all text-sm"
          >
            <Download size={16} />
            <span>{t.actions.downloadPdf}</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <section className="mb-12 print:mb-6" id="summary">
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 !print:text-blue-700 print:mb-2">{t.sections.summary}</h2>
        <p className="leading-relaxed text-slate-300 max-w-3xl !print:text-slate-800 whitespace-pre-wrap">
          {summary}
        </p>
      </section>

      {/* Experience */}
      <section className="mb-12 print:mb-6" id="experience">
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2 !print:text-blue-700 print:mb-4">
           <Briefcase size={18} /> {t.sections.experience}
        </h2>

        <div className="space-y-10 border-l border-slate-800 ml-2 pl-8 relative print:border-slate-300 print:space-y-6">
          
          {experience.map((exp, index) => (
            <div key={index} className="relative scroll-mt-24" id={`experience-${slugify(exp.company)}`}>
              <div className={`absolute -left-[38px] top-1 w-5 h-5 bg-slate-950 border-2 rounded-full print:bg-white print:w-4 print:h-4 print:-left-[37px] ${index === 0 ? 'border-blue-500 print:border-blue-700' : 'border-slate-700 print:border-slate-400'}`}></div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                <h3 className="text-xl font-semibold text-white !print:text-black">{exp.company}</h3>
                <span className="text-slate-400 text-sm print:text-slate-600">{exp.dates}</span>
              </div>
              <div className="text-blue-300 mb-4 text-sm font-medium !print:text-slate-700 print:mb-2">{exp.role}</div>
              <ul className="space-y-3 text-sm list-disc list-outside ml-4 text-slate-400 !print:text-slate-800 print:space-y-1">
                {exp.bullets.map((bullet, bIndex) => (
                  <li key={bIndex}>
                    {bullet.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i} className="text-white !print:text-black">{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>
      </section>

      {/* Education */}
      <section className="mb-12 print:mb-6" id="education">
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2 !print:text-blue-700 print:mb-4">
           <GraduationCap size={18} /> {t.sections.education}
        </h2>
        <div className="grid md:grid-cols-2 gap-6 print:gap-4">
          {education.map((edu, index) => (
            <div key={index} className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 print:bg-transparent print:border-slate-200 print:p-4">
              <h3 className="text-white font-semibold !print:text-black">{edu.school}</h3>
              <p className="text-sm text-blue-300 mb-2 !print:text-slate-700">{edu.degree}</p>
              <p className="text-xs text-slate-400 !print:text-slate-600">{edu.details}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership */}
      {leadership && leadership.length > 0 && (
        <section className="mb-12 print:mb-6" id="leadership">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2 !print:text-blue-700 print:mb-4">
            <Users size={18} /> {t.sections.leadership}
          </h2>
          <div className="grid gap-6 print:gap-4">
            {leadership.map((item, index) => (
              <div key={index} className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 print:bg-transparent print:border-slate-200 print:p-4 scroll-mt-24" id={`leadership-${slugify(item.organization)}`}>
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                    <h3 className="text-white font-semibold !print:text-black">{item.organization}</h3>
                    <span className="text-slate-400 text-sm print:text-slate-600">{item.dates}</span>
                  </div>
                <p className="text-sm text-blue-300 mb-2 !print:text-slate-700">{item.role}</p>
                <p className="text-xs text-slate-400 !print:text-slate-600">{item.details}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      <section className="mb-12 print:mb-6" id="skills">
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6 !print:text-blue-700 print:mb-4">{t.sections.skills}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
          {skills.map((skill, index) => (
            <div key={index} className="p-4 bg-slate-900/30 border border-slate-800 rounded-lg print:bg-transparent print:border-slate-200 print:p-2">
                <span className="text-xs text-slate-400 uppercase block mb-1 !print:text-slate-600">{skill.category}</span>
                <p className="text-sm text-slate-200 !print:text-black">{skill.items}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
