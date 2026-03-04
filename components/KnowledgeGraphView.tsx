import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Download, Share2, Check, Linkedin, List, Network } from 'lucide-react';
import { Resume } from './Resume';
import { GraphListFallback } from './GraphListFallback';
import { NodeDetailPanel } from './NodeDetailPanel';
import { getGraphData, HASH_TO_NODE, NODE_COLOR_MAP, NodeType } from '../lib/graph-data';
import { LINKEDIN_URL } from '../lib/knowledge';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { View } from '../types';

const ForceGraph = lazy(() =>
  import('./ForceGraph').then((m) => ({ default: m.ForceGraph }))
);

interface KnowledgeGraphViewProps {
  initialHash?: string | null;
  isInsideSplitView?: boolean;
  onNavigate?: (view: View, slug?: string) => void;
}

const GraphSkeleton: React.FC = () => {
  const dots = [
    { cx: '50%', cy: '40%', r: 24 },
    { cx: '30%', cy: '30%', r: 16 },
    { cx: '70%', cy: '30%', r: 16 },
    { cx: '25%', cy: '55%', r: 12 },
    { cx: '50%', cy: '65%', r: 12 },
    { cx: '75%', cy: '55%', r: 12 },
    { cx: '40%', cy: '50%', r: 10 },
    { cx: '60%', cy: '50%', r: 10 },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg className="w-full h-full max-w-lg max-h-96 opacity-30">
        {/* Skeleton edges */}
        <line x1="50%" y1="40%" x2="30%" y2="30%" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
        <line x1="50%" y1="40%" x2="70%" y2="30%" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
        <line x1="50%" y1="40%" x2="25%" y2="55%" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
        <line x1="50%" y1="40%" x2="75%" y2="55%" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
        <line x1="30%" y1="30%" x2="40%" y2="50%" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
        <line x1="70%" y1="30%" x2="60%" y2="50%" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
        {/* Skeleton dots */}
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            className="fill-slate-300 dark:fill-slate-700 graph-skeleton-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </svg>
    </div>
  );
};

const LEGEND_TYPES: { type: NodeType; key: string }[] = [
  { type: 'role', key: 'roles' },
  { type: 'project', key: 'projects' },
  { type: 'skill', key: 'skills' },
  { type: 'essay', key: 'essays' },
  { type: 'education', key: 'education' },
  { type: 'topic', key: 'topics' },
];

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  initialHash,
  isInsideSplitView: _isInsideSplitView,
  onNavigate,
}) => {
  const { t, language } = useLanguage();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showList, setShowList] = useState(false);

  const graphData = useMemo(() => getGraphData(language), [language]);

  const selectedNode = useMemo(
    () => graphData.nodes.find((n) => n.id === selectedNodeId) || null,
    [graphData.nodes, selectedNodeId]
  );

  // Deep-link hash mapping
  useEffect(() => {
    const hash = initialHash || window.location.hash;
    if (hash && HASH_TO_NODE[hash]) {
      setSelectedNodeId(HASH_TO_NODE[hash]);
    }
  }, [initialHash]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleSelectNode = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  };

  const handleNavigate = (view: View, slug?: string) => {
    onNavigate?.(view, slug);
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Print-only: render the exact existing Resume */}
      <div className="hidden print:block">
        <Resume initialHash={initialHash} isInsideSplitView />
      </div>

      {/* Screen-only: knowledge graph */}
      <div className="print:hidden flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t.graph.viewGraph}
            </h1>

            {/* View toggle (desktop only) */}
            {isDesktop && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => setShowList(false)}
                  className={`p-1.5 rounded-md transition-colors ${
                    !showList
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-700 dark:text-slate-200'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  title={t.graph.viewGraph}
                  aria-label={t.graph.viewGraph}
                >
                  <Network size={16} />
                </button>
                <button
                  onClick={() => setShowList(true)}
                  className={`p-1.5 rounded-md transition-colors ${
                    showList
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-700 dark:text-slate-200'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  title={t.graph.viewList}
                  aria-label={t.graph.viewList}
                >
                  <List size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 text-slate-500 dark:text-slate-400 rounded-lg transition-all text-xs"
              title={t.actions.viewLinkedin}
              aria-label={t.actions.viewLinkedin}
            >
              <Linkedin size={14} />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 text-slate-500 dark:text-slate-400 rounded-lg transition-all text-xs"
              title={t.actions.share}
              aria-label={isCopied ? t.actions.copied : t.actions.share}
            >
              {isCopied ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
              <span className={`hidden sm:inline ${isCopied ? 'text-green-400' : ''}`}>
                {isCopied ? t.actions.copied : t.actions.share}
              </span>
            </button>

            <button
              onClick={() => window.print()}
              title={t.actions.downloadPdf}
              aria-label={t.actions.downloadPdf}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 text-slate-500 dark:text-slate-400 rounded-lg transition-all text-xs"
            >
              <Download size={14} />
              <span className="hidden sm:inline">{t.actions.downloadPdf}</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 px-5 py-2 border-b border-slate-100 dark:border-slate-800/50 flex-shrink-0 overflow-x-auto">
          {LEGEND_TYPES.map(({ type, key }) => (
            <span key={type} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: NODE_COLOR_MAP[type]?.light }}
              />
              {(t.graph as Record<string, string>)[key]}
            </span>
          ))}
        </div>

        {/* Graph / List content */}
        <div className="flex-1 relative overflow-hidden">
          {!isDesktop || showList ? (
            <div className="h-full overflow-y-auto">
              <GraphListFallback
                nodes={graphData.nodes.filter((n) => n.type !== 'hub')}
                edges={graphData.edges}
                onSelectNode={(id) => handleSelectNode(id)}
                selectedNodeId={selectedNodeId}
              />
            </div>
          ) : (
            <Suspense fallback={<GraphSkeleton />}>
              <ForceGraph
                nodes={graphData.nodes}
                edges={graphData.edges}
                selectedNodeId={selectedNodeId}
                onSelectNode={handleSelectNode}
              />
            </Suspense>
          )}

          {/* Detail panel */}
          <NodeDetailPanel
            node={selectedNode}
            edges={graphData.edges}
            allNodes={graphData.nodes}
            onClose={() => setSelectedNodeId(null)}
            onNavigate={handleNavigate}
            isMobile={!isDesktop}
          />
        </div>
      </div>
    </div>
  );
};
