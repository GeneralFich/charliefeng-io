import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { Activity, Globe, TrendingUp, Layers, FileText, AlertTriangle, Calendar, Share2, Download, Check } from 'lucide-react';
import { WHITEPAPER_CONTENT } from '../lib/knowledge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

const { timeline: TIMELINE_DATA, risks: RISK_DATA, body: MANIFESTO_BODY } = WHITEPAPER_CONTENT;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl">
        <p className="text-slate-200 font-bold mb-1">{label}</p>
        <p className="text-blue-400 text-sm">
          {payload[0].value}% Impact
        </p>
        {payload[0].payload.stage && (
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">
            {payload[0].payload.stage}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC = () => {
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    try {
      const shareText = "Check out this strategic whitepaper on the Agentic Inflection Point by Charlie Feng: " + window.location.href;
      await navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL: ', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12 animate-fade-in print:p-0 print:max-w-none print:space-y-6">
      <header className="border-b border-slate-800 pb-8 flex flex-col md:flex-row justify-between items-start gap-6 print:border-none print:pb-4">
        <div className="max-w-4xl">
          <h2 className="text-3xl font-light tracking-tight text-white flex items-center gap-3 print:text-black">
            <Activity className="text-blue-500 print:text-blue-700" />
            The Agentic Inflection Point
          </h2>
          <p className="text-slate-400 mt-4 text-lg leading-relaxed max-w-4xl print:text-black">
            We stand at a critical juncture where AI transitions from a passive tool to an active "Teammate".
            This dashboard visualizes the core thesis of the 2025-2030 transition: a massive economic metamorphosis
            driven by autonomous agents, an accelerating AGI timeline, and the structural "unbundling" of human labor.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 print:hidden">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 hover:border-blue-500/50 hover:text-blue-400 text-slate-400 rounded-lg transition-all text-sm"
            aria-label={isCopied ? "Copied to clipboard" : "Share Dashboard"}
          >
            {isCopied ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
            <span>{isCopied ? 'Copied' : 'Share'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 hover:border-blue-500/50 hover:text-blue-400 text-slate-400 rounded-lg transition-all text-sm"
          >
            <Download size={16} />
            <span>Export PDF</span>
          </button>
        </div>
      </header>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:gap-4">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-colors print:bg-white print:border-slate-300 print:p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg print:bg-blue-100">
              <Calendar className="text-blue-400 print:text-blue-700" size={20} />
            </div>
            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider print:text-slate-600">Arrival Consensus</div>
          </div>
          <div className="text-3xl font-bold text-white mb-1 print:text-black">2030</div>
          <div className="text-sm text-slate-400 print:text-slate-700">Most likely year for Robust AGI</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-colors print:bg-white print:border-slate-300 print:p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/10 rounded-lg print:bg-green-100">
              <Globe className="text-green-400 print:text-green-700" size={20} />
            </div>
            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider print:text-slate-600">Economic Impact</div>
          </div>
          <div className="text-3xl font-bold text-white mb-1 print:text-black">$13 Trillion</div>
          <div className="text-sm text-slate-400 print:text-slate-700">Global GDP boost by 2030</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-colors print:bg-white print:border-slate-300 print:p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-500/10 rounded-lg print:bg-amber-100">
              <AlertTriangle className="text-amber-400 print:text-amber-700" size={20} />
            </div>
            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider print:text-slate-600">Near-Term Risk</div>
          </div>
          <div className="text-3xl font-bold text-white mb-1 print:text-black">25%</div>
          <div className="text-sm text-slate-400 print:text-slate-700">Probability of AGI by 2027</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-colors print:bg-white print:border-slate-300 print:p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/10 rounded-lg print:bg-purple-100">
              <Layers className="text-purple-400 print:text-purple-700" size={20} />
            </div>
            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider print:text-slate-600">Labor Shift</div>
          </div>
          <div className="text-2xl font-bold text-white mb-1 print:text-black">Unbundling</div>
          <div className="text-sm text-slate-400 print:text-slate-700">Jobs split into agentic tasks</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:gap-6 print:break-inside-avoid">
        {/* Chart 1: AGI Timeline */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 print:bg-white print:border-slate-300 print:p-4">
          <h3 className="text-lg font-medium text-slate-200 mb-2 flex items-center gap-2 print:text-black">
            <TrendingUp size={18} className="text-blue-500 print:text-blue-700" />
            The Consensus Timeline
          </h3>
          <p className="text-sm text-slate-500 mb-6 print:text-slate-700">
            Aggregated forecast of AGI capability progression (0-100 scale).
          </p>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={TIMELINE_DATA}>
                <defs>
                  <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  stroke="#475569" 
                  tick={{ fill: '#475569', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1 }} />
                <Area 
                  type="monotone" 
                  dataKey="level" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorLevel)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-4 px-2 font-mono print:text-slate-700">
            <span>2024: GEN</span>
            <span>2027: WEAK AGI</span>
            <span>2030: ROBUST</span>
          </div>
        </div>

        {/* Chart 2: Job Risk */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 print:bg-white print:border-slate-300 print:p-4">
          <h3 className="text-lg font-medium text-slate-200 mb-2 flex items-center gap-2 print:text-black">
            <AlertTriangle size={18} className="text-red-500 print:text-red-700" />
            Sector Vulnerability Index
          </h3>
          <p className="text-sm text-slate-500 mb-6 print:text-slate-700">
             Relative risk of displacement due to agentic automation.
          </p>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={RISK_DATA} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#1e293b' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                         <div className="bg-slate-900 border border-slate-700 p-2 rounded text-xs text-white">
                           Risk Score: {payload[0].value}
                         </div>
                      )
                    }
                    return null;
                  }}
                />
                <Bar dataKey="risk" radius={[0, 4, 4, 0]} barSize={32}>
                  {RISK_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Manifesto Content */}
      <div className="mt-12 pt-8 border-t border-slate-800 print:border-slate-300 print:mt-6 print:pt-6">
        <h3 className="text-xl font-light text-white mb-6 flex items-center gap-2 print:text-black">
          <FileText className="text-slate-400 print:text-slate-600" size={20} />
          Full Manifesto
        </h3>
        <div className="bg-slate-900/30 rounded-xl p-8 border border-slate-800/50 prose prose-invert prose-slate max-w-none print:bg-white print:border-none print:p-0 print:prose-p:text-black print:prose-headings:text-black print:prose-strong:text-black print:prose-li:text-black">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              a: ({ node, ...props }) => {
                const href = props.href || '';
                const isInternal = href.startsWith('#');

                // Security: Prevent XSS via malicious links (e.g. javascript:)
                const isSafe = href.startsWith('http') || href.startsWith('mailto') || href.startsWith('/') || href.startsWith('#');
                if (!isSafe) {
                  return <span {...props} className="text-slate-400" title="Link disabled">{props.children}</span>;
                }

                const handleClick = (e: React.MouseEvent) => {
                  if (isInternal) {
                    e.preventDefault();
                    const id = href.slice(1);
                    let el = document.getElementById(id);
                    // Fallback for double-prefixed IDs (remark-gfm + rehype-sanitize conflict)
                    if (!el) {
                      el = document.getElementById(`user-content-${id}`);
                    }
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                };

                return (
                  <a
                    {...props}
                    onClick={handleClick}
                    className={`text-blue-400 hover:text-blue-300 transition-colors break-words [overflow-wrap:anywhere] ${!isInternal ? 'no-underline border-b border-blue-400/30 hover:border-blue-300' : ''} print:text-blue-700 print:border-blue-700/30`}
                    target={isInternal ? undefined : "_blank"}
                    rel={isInternal ? undefined : "noopener noreferrer"}
                  />
                );
              }
            }}
          >
            {MANIFESTO_BODY}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
