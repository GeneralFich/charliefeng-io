import React, { useState } from 'react';
import { Download, MapPin, Mail, Phone, Briefcase, GraduationCap, Users, Check, Copy } from 'lucide-react';
import { RESUME_CONTENT } from '../lib/knowledge';

const CopyableContactInfo: React.FC<{
  icon: React.ElementType;
  text: string;
  label: string;
}> = ({ icon: Icon, text, label }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer group relative print:cursor-text print:hover:text-slate-600"
      title={`Copy ${label}`}
      aria-label={`Copy ${label}: ${text}`}
      type="button"
    >
      <div className="relative">
        <Icon size={14} className={`transition-opacity duration-200 ${isCopied ? 'opacity-0' : 'opacity-100'}`} />
        <Check size={14} className={`text-green-400 absolute top-0 left-0 transition-opacity duration-200 ${isCopied ? 'opacity-100' : 'opacity-0'}`} />
      </div>
      <span className={isCopied ? "text-green-400 transition-colors duration-200" : "transition-colors duration-200"}>
        {text}
      </span>
      {/* Tooltip for non-touch devices */}
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-slate-700 print:hidden">
        {isCopied ? 'Copied!' : 'Click to copy'}
      </span>
    </button>
  );
};

export const Resume: React.FC = () => {
  const { name, location, email, phone, summary, experience, education, leadership, skills } = RESUME_CONTENT;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 animate-fade-in text-slate-300 print:text-black print:p-0 print:max-w-none">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:border-slate-300 print:mb-4 print:pb-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2 print:text-black">{name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400 print:text-slate-600">
             <span className="flex items-center gap-1 cursor-default"><MapPin size={14} /> {location}</span>
             <CopyableContactInfo icon={Mail} text={email} label="Email" />
             {phone && <CopyableContactInfo icon={Phone} text={phone} label="Phone" />}
          </div>
        </div>
        <button
          onClick={() => window.print()}
          title="Print or Save as PDF"
          aria-label="Print or Save as PDF"
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors border border-slate-700 print:hidden"
        >
          <Download size={16} />
          <span>Download PDF</span>
        </button>
      </div>

      {/* Summary */}
      <section className="mb-12 print:mb-6">
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 print:text-blue-700 print:mb-2">Executive Summary</h2>
        <p className="leading-relaxed text-slate-300 max-w-3xl print:text-slate-800">
          {summary}
        </p>
      </section>

      {/* Experience */}
      <section className="mb-12 print:mb-6">
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2 print:text-blue-700 print:mb-4">
           <Briefcase size={18} /> Professional Experience
        </h2>

        <div className="space-y-10 border-l border-slate-800 ml-2 pl-8 relative print:border-slate-300 print:space-y-6">
          
          {experience.map((exp, index) => (
            <div key={index} className="relative">
              <div className={`absolute -left-[38px] top-1 w-5 h-5 bg-slate-950 border-2 rounded-full print:bg-white print:w-4 print:h-4 print:-left-[37px] ${index === 0 ? 'border-blue-500 print:border-blue-700' : 'border-slate-700 print:border-slate-400'}`}></div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                <h3 className="text-xl font-semibold text-white print:text-black">{exp.company}</h3>
                <span className="text-slate-400 text-sm print:text-slate-600">{exp.dates}</span>
              </div>
              <div className="text-blue-300 mb-4 text-sm font-medium print:text-slate-700 print:mb-2">{exp.role}</div>
              <ul className="space-y-3 text-sm list-disc list-outside ml-4 text-slate-400 print:text-slate-800 print:space-y-1">
                {exp.bullets.map((bullet, bIndex) => (
                  <li key={bIndex}>
                    {bullet.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i} className="text-white print:text-black">{part.slice(2, -2)}</strong>;
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
      <section className="mb-12 print:mb-6">
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2 print:text-blue-700 print:mb-4">
           <GraduationCap size={18} /> Education
        </h2>
        <div className="grid md:grid-cols-2 gap-6 print:gap-4">
          {education.map((edu, index) => (
            <div key={index} className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 print:bg-transparent print:border-slate-200 print:p-4">
              <h3 className="text-white font-semibold print:text-black">{edu.school}</h3>
              <p className="text-sm text-blue-300 mb-2 print:text-slate-700">{edu.degree}</p>
              <p className="text-xs text-slate-400 print:text-slate-600">{edu.details}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership */}
      {leadership && leadership.length > 0 && (
        <section className="mb-12 print:mb-6">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2 print:text-blue-700 print:mb-4">
            <Users size={18} /> Leadership & Community
          </h2>
          <div className="grid gap-6 print:gap-4">
            {leadership.map((item, index) => (
              <div key={index} className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 print:bg-transparent print:border-slate-200 print:p-4">
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                    <h3 className="text-white font-semibold print:text-black">{item.organization}</h3>
                    <span className="text-slate-400 text-sm print:text-slate-600">{item.dates}</span>
                  </div>
                <p className="text-sm text-blue-300 mb-2 print:text-slate-700">{item.role}</p>
                <p className="text-xs text-slate-400 print:text-slate-600">{item.details}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      <section>
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6 print:text-blue-700 print:mb-4">Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
          {skills.map((skill, index) => (
            <div key={index} className="p-4 bg-slate-900/30 border border-slate-800 rounded-lg print:bg-transparent print:border-slate-200 print:p-2">
                <span className="text-xs text-slate-400 uppercase block mb-1 print:text-slate-600">{skill.category}</span>
                <p className="text-sm text-slate-200 print:text-black">{skill.items}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
