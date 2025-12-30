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
import { TrendingUp, AlertTriangle } from 'lucide-react';

/**
 * @fileoverview Whitepaper Visualizations Component
 *
 * "What": This component renders the interactive AGI Timeline and Sector Vulnerability charts
 * specifically for the "Strategic Whitepaper" essay.
 *
 * "Why": While the text content lives in `content/posts/strategic-whitepaper.md`, complex
 * interactive visualizations (using Recharts) cannot be rendered natively in Markdown.
 * We use a "Custom Code Block" pattern to inject this React component into the Markdown flow.
 *
 * "How":
 * 1. The Markdown file contains a code block:
 *    ```infographic
 *    whitepaper-charts
 *    ```
 * 2. `EssayDetail.tsx` intercepts this code block during Markdown parsing.
 * 3. It replaces the code block with this `<WhitepaperCharts />` component.
 */

// Data source: "The Asymptotic Trajectory" (Internal Research)
// Represents the consensus forecast for AGI capabilities.
const TIMELINE_DATA = [
  { year: '2024', level: 20, stage: 'Generative' },
  { year: '2025', level: 40, stage: 'Teammate Era' },
  { year: '2026', level: 55, stage: 'Teammate Era' },
  { year: '2027', level: 75, stage: 'Weak AGI' },
  { year: '2028', level: 85, stage: 'Weak AGI' },
  { year: '2029', level: 95, stage: 'Robust AGI' },
  { year: '2030', level: 100, stage: 'Robust AGI' },
];

// Data source: Bureau of Labor Statistics & Oxford Martin School
// Represents the relative risk of job displacement by AI Agents.
const RISK_DATA = [
  { name: 'Translation', risk: 90, fill: '#ef4444' },
  { name: 'Admin', risk: 80, fill: '#f97316' },
  { name: 'Coding', risk: 50, fill: '#eab308' },
  { name: 'Trades', risk: 10, fill: '#22c55e' },
  { name: 'Nursing', risk: 5, fill: '#3b82f6' },
];

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

/**
 * Renders the AGI Timeline and Sector Vulnerability charts.
 * This component is intended to be embedded within the `EssayDetail` view via MDX/Custom replacement.
 */
export const WhitepaperCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-12">
      {/* Chart 1: AGI Timeline */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-medium text-slate-200 mb-2 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-500" />
          The Consensus Timeline
        </h3>
        <p className="text-sm text-slate-500 mb-6">
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
      </div>

      {/* Chart 2: Job Risk */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-medium text-slate-200 mb-2 flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-500" />
          Sector Vulnerability Index
        </h3>
        <p className="text-sm text-slate-500 mb-6">
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
  );
};
