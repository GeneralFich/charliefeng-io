import React, { useState } from 'react';
import { Network, X, Server, Database, Globe, BrainCircuit, Workflow, Cpu, Layers } from 'lucide-react';

export const ArchitectureMap = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const nodes = [
    {
      id: 'frontend',
      label: 'React Frontend',
      icon: Globe,
      description: 'Single Page Application (SPA) built with Vite & React 19. Uses Tailwind for styling and Lucide for icons.',
      tech: ['React 19', 'Vite', 'Tailwind CSS', 'TypeScript'],
      x: 50,
      y: 20
    },
    {
      id: 'edge',
      label: 'Edge Function',
      icon: Network,
      description: 'Serverless proxy layer running on Vercel Edge Runtime. Handles API authentication and request sanitization.',
      tech: ['Vercel Edge', 'Node.js'],
      x: 50,
      y: 50
    },
    {
      id: 'rag',
      label: 'Vector Store',
      icon: Database,
      description: 'In-memory semantic search engine. Stores chunks of blog posts with pre-calculated cosine similarity magnitudes for <10ms retrieval.',
      tech: ['JSON Store', 'Cosine Similarity', 'Embeddings-004'],
      x: 20,
      y: 50
    },
    {
      id: 'llm',
      label: 'Gemini 2.0 Flash',
      icon: BrainCircuit,
      description: 'Google\'s multimodal LLM. Receives the user query + retrieved context to generate the final response.',
      tech: ['Google Gemini API', 'Context Window: 1M'],
      x: 80,
      y: 50
    },
    {
      id: 'ingest',
      label: 'Ingestion Pipeline',
      icon: Workflow,
      description: 'Build-time script that parses Markdown files, generates embeddings, and compiles the knowledge base.',
      tech: ['Node Script', 'Remark/Rehype'],
      x: 20,
      y: 80
    }
  ];

  const connections = [
    { from: 'frontend', to: 'edge' },
    { from: 'edge', to: 'rag' },
    { from: 'edge', to: 'llm' },
    { from: 'ingest', to: 'rag' }
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-full border bg-slate-800 border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
      >
        <Network size={12} />
        <span>System Architecture</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl h-[600px] shadow-2xl overflow-hidden flex flex-col relative">

            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Layers className="text-emerald-500" />
                    System Architecture
                </h2>
                <p className="text-sm text-slate-400">Interactive map of the "Interactive Knowledge Model" stack.</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/50 via-slate-900 to-slate-950 overflow-hidden">
                {/* Grid Background */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.1 }}></div>

                {/* Connections (SVG Lines) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
                        </marker>
                    </defs>
                    {connections.map((conn, i) => {
                        const start = nodes.find(n => n.id === conn.from);
                        const end = nodes.find(n => n.id === conn.to);
                        if (!start || !end) return null;

                        return (
                            <line
                                key={i}
                                x1={`${start.x}%`}
                                y1={`${start.y}%`}
                                x2={`${end.x}%`}
                                y2={`${end.y}%`}
                                stroke="#475569"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                markerEnd="url(#arrowhead)"
                                className="animate-pulse-slow"
                            />
                        );
                    })}
                </svg>

                {/* Nodes */}
                {nodes.map((node) => (
                    <div
                        key={node.id}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${activeNode === node.id ? 'scale-110 z-10' : 'hover:scale-105'}`}
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        onMouseEnter={() => setActiveNode(node.id)}
                        onClick={() => setActiveNode(node.id)}
                    >
                        <div className={`
                            w-16 h-16 rounded-xl flex items-center justify-center border-2 shadow-xl transition-colors
                            ${activeNode === node.id
                                ? 'bg-slate-800 border-emerald-500 text-emerald-400 shadow-emerald-500/20'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}
                        `}>
                            <node.icon size={28} />
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${activeNode === node.id ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                                {node.label}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Info Panel (Bottom Overlay) */}
                <div className={`absolute bottom-0 left-0 right-0 bg-slate-900/90 border-t border-slate-800 p-6 transition-transform duration-300 ${activeNode ? 'translate-y-0' : 'translate-y-full'}`}>
                   {activeNode && (() => {
                       const node = nodes.find(n => n.id === activeNode)!;
                       return (
                           <div className="max-w-3xl mx-auto flex items-start gap-6">
                               <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 hidden sm:block">
                                   <node.icon size={32} className="text-emerald-400" />
                               </div>
                               <div>
                                   <h3 className="text-xl font-bold text-white mb-2">{node.label}</h3>
                                   <p className="text-slate-400 mb-4">{node.description}</p>
                                   <div className="flex flex-wrap gap-2">
                                       {node.tech.map(t => (
                                           <span key={t} className="px-2 py-1 bg-slate-800 rounded text-xs text-emerald-400 border border-emerald-500/20">
                                               {t}
                                           </span>
                                       ))}
                                   </div>
                               </div>
                           </div>
                       );
                   })()}
                </div>

                {/* Instruction Placeholder if no node selected */}
                {!activeNode && (
                     <div className="absolute bottom-8 left-0 right-0 text-center text-slate-500 text-sm pointer-events-none animate-pulse">
                        Hover over a component to see design decisions
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
