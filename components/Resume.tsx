import React from 'react';
import { Download, MapPin, Mail, Briefcase, GraduationCap, Activity } from 'lucide-react';
import { Dashboard } from './Dashboard';

export const Resume: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 animate-fade-in text-slate-300 print:text-black print:p-0 print:max-w-none">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:border-slate-300 print:mb-4 print:pb-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2 print:text-black">CHARLIE FENG</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400 print:text-slate-600">
             <span className="flex items-center gap-1"><MapPin size={14} /> Mercer Island, WA</span>
             <span className="flex items-center gap-1"><Mail size={14} /> charliefengsq@gmail.com</span>
          </div>
        </div>
        <button
          onClick={() => window.print()}
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
          Infrastructure Product Leader with 8+ years of experience defining strategy for critical compute capacity and resilience. Expert in translating Hardware Engineering and ML constraints into high-leverage software products. Pioneered agentic AI tools and climate intelligence platforms at Google Data Centers that captured $50M+ in efficiency gains.
        </p>
      </section>

      {/* Live Research / Dashboard */}
      <section className="mb-12 print:hidden">
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
           <Activity size={18} /> Live Research: Preparing for AGI
        </h2>
        <div className="bg-slate-950/50 -mx-6 px-6 py-6 border-y border-slate-800/50 md:rounded-xl md:border md:mx-0">
           <Dashboard />
        </div>
      </section>

      {/* Experience */}
      <section className="mb-12 print:mb-6">
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2 print:text-blue-700 print:mb-4">
           <Briefcase size={18} /> Professional Experience
        </h2>

        <div className="space-y-10 border-l border-slate-800 ml-2 pl-8 relative print:border-slate-300 print:space-y-6">
          
          {/* Google */}
          <div className="relative">
            <div className="absolute -left-[38px] top-1 w-5 h-5 bg-slate-950 border-2 border-blue-500 rounded-full print:bg-white print:border-blue-700 print:w-4 print:h-4 print:-left-[37px]"></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
              <h3 className="text-xl font-semibold text-white print:text-black">Google</h3>
              <span className="text-slate-500 text-sm print:text-slate-600">July 2022 – Present</span>
            </div>
            <div className="text-blue-300 mb-4 text-sm font-medium print:text-slate-700 print:mb-2">Technical Program Manager, Data Centers</div>
            <ul className="space-y-3 text-sm list-disc list-outside ml-4 text-slate-400 print:text-slate-800 print:space-y-1">
              <li>Identified and captured a <strong className="text-white print:text-black">$50M annual efficiency opportunity</strong> by defining the product vision for a Climate Intelligence platform, reducing thermal throttling by 70%.</li>
              <li>Launched a zero-to-one <strong className="text-white print:text-black">Agentic AI platform</strong> for 500+ Design & Ops leads, achieving 90%+ retrieval accuracy.</li>
              <li>Owns the Product Roadmap for the Data & ML Operations suite; prioritized investments to support double-digit YoY TPU fleet growth.</li>
              <li>Aligned 50+ stakeholders across Hardware Engineering and ML Software to resolve conflicting thermal/compute constraints.</li>
            </ul>
          </div>

          {/* Amazon */}
          <div className="relative">
             <div className="absolute -left-[38px] top-1 w-5 h-5 bg-slate-950 border-2 border-slate-700 rounded-full print:bg-white print:border-slate-400 print:w-4 print:h-4 print:-left-[37px]"></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
              <h3 className="text-xl font-semibold text-white print:text-black">Amazon.com</h3>
              <span className="text-slate-500 text-sm print:text-slate-600">Sept 2021 – July 2022</span>
            </div>
            <div className="text-blue-300 mb-4 text-sm font-medium print:text-slate-700 print:mb-2">Senior Program Manager, Operations Technology</div>
            <ul className="space-y-3 text-sm list-disc list-outside ml-4 text-slate-400 print:text-slate-800 print:space-y-1">
              <li>Led technical product integration strategy with <strong className="text-white print:text-black">Rivian</strong>, launching Amazon's custom electric fleet (scaled 4 to 100+ vehicles).</li>
              <li>Launched "Observability as a Service" for 36 logistics programs, slashing anomaly detection time from days to seconds.</li>
            </ul>
          </div>

          {/* EY */}
          <div className="relative">
            <div className="absolute -left-[38px] top-1 w-5 h-5 bg-slate-950 border-2 border-slate-700 rounded-full print:bg-white print:border-slate-400 print:w-4 print:h-4 print:-left-[37px]"></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
              <h3 className="text-xl font-semibold text-white print:text-black">Ernst & Young</h3>
              <span className="text-slate-500 text-sm print:text-slate-600">Aug 2015 – July 2019</span>
            </div>
            <div className="text-blue-300 mb-4 text-sm font-medium print:text-slate-700 print:mb-2">Consultant / Senior Consultant</div>
            <ul className="space-y-3 text-sm list-disc list-outside ml-4 text-slate-400 print:text-slate-800 print:space-y-1">
              <li>Led strategic engagements for Fortune 500 C-Suite clients, building quantitative market models.</li>
              <li>Managed and mentored high-performing teams of up to 19 consultants.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="mb-12 print:mb-6">
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2 print:text-blue-700 print:mb-4">
           <GraduationCap size={18} /> Education
        </h2>
        <div className="grid md:grid-cols-2 gap-6 print:gap-4">
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 print:bg-transparent print:border-slate-200 print:p-4">
            <h3 className="text-white font-semibold print:text-black">Yale School of Management</h3>
            <p className="text-sm text-blue-300 mb-2 print:text-slate-700">Master of Business Administration (2021)</p>
            <p className="text-xs text-slate-500 print:text-slate-600">President, Data Analytics Club. Led 200-member org teaching SQL/Python.</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 print:bg-transparent print:border-slate-200 print:p-4">
            <h3 className="text-white font-semibold print:text-black">NYU Stern School of Business</h3>
            <p className="text-sm text-blue-300 mb-2 print:text-slate-700">B.S. Finance, CS & Math (2015)</p>
            <p className="text-xs text-slate-500 print:text-slate-600">Relevant Coursework: Algorithms, Data Structures, Game Theory.</p>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6 print:text-blue-700 print:mb-4">Technical Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
            <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-lg print:bg-transparent print:border-slate-200 print:p-2">
                <span className="text-xs text-slate-500 uppercase block mb-1 print:text-slate-600">Product Strategy</span>
                <p className="text-sm text-slate-200 print:text-black">Infrastructure Roadmapping, Build-vs-Buy, GTM Strategy, User Research, API Definition</p>
            </div>
            <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-lg print:bg-transparent print:border-slate-200 print:p-2">
                <span className="text-xs text-slate-500 uppercase block mb-1 print:text-slate-600">AI & Compute</span>
                <p className="text-sm text-slate-200 print:text-black">Agentic AI (LangChain, MCP), GPU/TPU Architecture, Capacity Planning, Kubernetes</p>
            </div>
            <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-lg print:bg-transparent print:border-slate-200 print:p-2">
                <span className="text-xs text-slate-500 uppercase block mb-1 print:text-slate-600">Stack</span>
                <p className="text-sm text-slate-200 print:text-black">Python, SQL, BigQuery, Tableau, Looker, TensorFlow, Vertex AI</p>
            </div>
        </div>
      </section>
    </div>
  );
};
