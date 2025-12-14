import React from 'react';
import { Download, MapPin, Mail, Briefcase, GraduationCap } from 'lucide-react';

export const Resume: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 animate-fade-in text-slate-300">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">CHARLIE FENG</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
             <span className="flex items-center gap-1"><MapPin size={14} /> Mercer Island, WA</span>
             <span className="flex items-center gap-1"><Mail size={14} /> charliefengsq@gmail.com</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors border border-slate-700">
          <Download size={16} />
          <span>Download PDF</span>
        </button>
      </div>

      {/* Summary */}
      <section className="mb-12">
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">Executive Summary</h2>
        <p className="leading-relaxed text-slate-300 max-w-3xl">
          Infrastructure Product Leader with 8+ years of experience defining strategy for critical compute capacity and resilience. Expert in translating Hardware Engineering and ML constraints into high-leverage software products. Pioneered agentic AI tools and climate intelligence platforms at Google Data Centers that captured $50M+ in efficiency gains.
        </p>
      </section>

      {/* Experience */}
      <section className="mb-12">
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
           <Briefcase size={18} /> Professional Experience
        </h2>

        <div className="space-y-10 border-l border-slate-800 ml-2 pl-8 relative">
          
          {/* Google */}
          <div className="relative">
            <div className="absolute -left-[38px] top-1 w-5 h-5 bg-slate-950 border-2 border-blue-500 rounded-full"></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
              <h3 className="text-xl font-semibold text-white">Google</h3>
              <span className="text-slate-500 text-sm">July 2022 – Present</span>
            </div>
            <div className="text-blue-300 mb-4 text-sm font-medium">Technical Program Manager, Data Centers</div>
            <ul className="space-y-3 text-sm list-disc list-outside ml-4 text-slate-400">
              <li>Identified and captured a <strong className="text-white">$50M annual efficiency opportunity</strong> by defining the product vision for a Climate Intelligence platform, reducing thermal throttling by 70%.</li>
              <li>Launched a zero-to-one <strong className="text-white">Agentic AI platform</strong> for 500+ Design & Ops leads, achieving 90%+ retrieval accuracy.</li>
              <li>Owns the Product Roadmap for the Data & ML Operations suite; prioritized investments to support double-digit YoY TPU fleet growth.</li>
              <li>Aligned 50+ stakeholders across Hardware Engineering and ML Software to resolve conflicting thermal/compute constraints.</li>
            </ul>
          </div>

          {/* Amazon */}
          <div className="relative">
             <div className="absolute -left-[38px] top-1 w-5 h-5 bg-slate-950 border-2 border-slate-700 rounded-full"></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
              <h3 className="text-xl font-semibold text-white">Amazon.com</h3>
              <span className="text-slate-500 text-sm">Sept 2021 – July 2022</span>
            </div>
            <div className="text-blue-300 mb-4 text-sm font-medium">Senior Program Manager, Operations Technology</div>
            <ul className="space-y-3 text-sm list-disc list-outside ml-4 text-slate-400">
              <li>Led technical product integration strategy with <strong className="text-white">Rivian</strong>, launching Amazon's custom electric fleet (scaled 4 to 100+ vehicles).</li>
              <li>Launched "Observability as a Service" for 36 logistics programs, slashing anomaly detection time from days to seconds.</li>
            </ul>
          </div>

          {/* EY */}
          <div className="relative">
            <div className="absolute -left-[38px] top-1 w-5 h-5 bg-slate-950 border-2 border-slate-700 rounded-full"></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
              <h3 className="text-xl font-semibold text-white">Ernst & Young</h3>
              <span className="text-slate-500 text-sm">Aug 2015 – July 2019</span>
            </div>
            <div className="text-blue-300 mb-4 text-sm font-medium">Consultant / Senior Consultant</div>
            <ul className="space-y-3 text-sm list-disc list-outside ml-4 text-slate-400">
              <li>Led strategic engagements for Fortune 500 C-Suite clients, building quantitative market models.</li>
              <li>Managed and mentored high-performing teams of up to 19 consultants.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="mb-12">
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
           <GraduationCap size={18} /> Education
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
            <h3 className="text-white font-semibold">Yale School of Management</h3>
            <p className="text-sm text-blue-300 mb-2">Master of Business Administration (2021)</p>
            <p className="text-xs text-slate-500">President, Data Analytics Club. Led 200-member org teaching SQL/Python.</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
            <h3 className="text-white font-semibold">NYU Stern School of Business</h3>
            <p className="text-sm text-blue-300 mb-2">B.S. Finance, CS & Math (2015)</p>
            <p className="text-xs text-slate-500">Relevant Coursework: Algorithms, Data Structures, Game Theory.</p>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6">Technical Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-lg">
                <span className="text-xs text-slate-500 uppercase block mb-1">Product Strategy</span>
                <p className="text-sm text-slate-200">Infrastructure Roadmapping, Build-vs-Buy, GTM Strategy, User Research, API Definition</p>
            </div>
            <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-lg">
                <span className="text-xs text-slate-500 uppercase block mb-1">AI & Compute</span>
                <p className="text-sm text-slate-200">Agentic AI (LangChain, MCP), GPU/TPU Architecture, Capacity Planning, Kubernetes</p>
            </div>
            <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-lg">
                <span className="text-xs text-slate-500 uppercase block mb-1">Stack</span>
                <p className="text-sm text-slate-200">Python, SQL, BigQuery, Tableau, Looker, TensorFlow, Vertex AI</p>
            </div>
        </div>
      </section>
    </div>
  );
};
