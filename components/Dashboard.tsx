import React from 'react';
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
import { Activity, Zap, ShieldAlert, Cpu, FileText, Info } from 'lucide-react';
import { WHITEPAPER_CONTENT } from '../lib/knowledge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in">
      <header className="mb-8 border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-light tracking-tight text-white flex items-center gap-3">
          <Activity className="text-blue-500" />
          Agentic Dashboard
        </h2>
        <p className="text-slate-400 mt-2 text-sm">
          This dashboard visualizes real-time signals and metrics derived explicitly from my "Preparing for AGI" Manifesto, providing context on the trajectory of Artificial General Intelligence and its economic impact.
        </p>
      </header>

      {/* Status Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-lg">
            <Zap className="text-green-400" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="text-xs text-slate-500 uppercase tracking-widest">System Status</div>
              <div className="relative group">
                <Info size={14} className="text-slate-500 hover:text-slate-300 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 border border-slate-700 text-slate-200 text-xs p-2 rounded shadow-lg hidden group-hover:block z-50">
                  Current market capability of AI agents, not website backend status.
                </div>
              </div>
            </div>
            <div className="text-lg font-semibold text-slate-200">Agentic Workflow: Active</div>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <Cpu className="text-blue-400" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="text-xs text-slate-500 uppercase tracking-widest">Velocity</div>
              <div className="relative group">
                <Info size={14} className="text-slate-500 hover:text-slate-300 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 border border-slate-700 text-slate-200 text-xs p-2 rounded shadow-lg hidden group-hover:block z-50">
                  Accelerating rate of AGI development and research papers globally.
                </div>
              </div>
            </div>
            <div className="text-lg font-semibold text-slate-200">High (2025 Inflection)</div>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-lg">
            <ShieldAlert className="text-purple-400" size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-widest">Est. AGI Arrival</div>
            <div className="text-lg font-semibold text-slate-200">2030 (Robust)</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: AGI Timeline */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-medium text-slate-200 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Consensus AGI Arrival Trajectory
          </h3>
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
          <div className="flex justify-between text-xs text-slate-500 mt-4 px-2">
            <span>2024: Generative</span>
            <span>2027: Weak AGI</span>
            <span>2030: Robust AGI</span>
          </div>
        </div>

        {/* Chart 2: Job Risk */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-medium text-slate-200 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Job Displacement Risk by Sector
          </h3>
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
      <div className="mt-12 pt-8 border-t border-slate-800">
        <h3 className="text-xl font-light text-white mb-6 flex items-center gap-2">
          <FileText className="text-slate-400" size={20} />
          Full Manifesto
        </h3>
        <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-800/50 prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => {
                const isExternal = props.href?.startsWith('http') ?? false;
                return (
                  <a
                    {...props}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
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
