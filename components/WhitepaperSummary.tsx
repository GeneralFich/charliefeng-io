import React from 'react';
import { Calendar, Globe, AlertTriangle, Layers } from 'lucide-react';

export const WhitepaperSummary: React.FC = () => {
  return (
    <div className="not-prose mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Calendar className="text-blue-400" size={20} />
          </div>
          <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Arrival Consensus</div>
        </div>
        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">2030</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">Most likely year for Robust AGI</div>
      </div>

      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Globe className="text-green-400" size={20} />
          </div>
          <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Economic Impact</div>
        </div>
        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">$13 Trillion</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">Global GDP boost by 2030</div>
      </div>

      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <AlertTriangle className="text-amber-400" size={20} />
          </div>
          <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Near-Term Risk</div>
        </div>
        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">25%</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">Probability of AGI by 2027</div>
      </div>

      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Layers className="text-purple-400" size={20} />
          </div>
          <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Labor Shift</div>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Unbundling</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">Jobs split into agentic tasks</div>
      </div>
    </div>
  );
};
