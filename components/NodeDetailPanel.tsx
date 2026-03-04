import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, BookOpen } from 'lucide-react';
import { GraphNode, NODE_COLOR_MAP, GraphEdge } from '../lib/graph-data';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { useTheme } from '../lib/ThemeContext';
import { View } from '../types';

interface NodeDetailPanelProps {
  node: GraphNode | null;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onClose: () => void;
  onNavigate?: (view: View, slug?: string) => void;
  isMobile?: boolean;
}

export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
  node,
  edges,
  allNodes,
  onClose,
  onNavigate,
  isMobile,
}) => {
  const { t } = useLanguage();
  const { resolved: theme } = useTheme();

  const connectedNodes = React.useMemo(() => {
    if (!node) return [];
    const connectedIds = new Set<string>();
    for (const edge of edges) {
      if (edge.source === node.id) connectedIds.add(edge.target);
      if (edge.target === node.id) connectedIds.add(edge.source);
    }
    return allNodes.filter((n) => connectedIds.has(n.id));
  }, [node, edges, allNodes]);

  const desktopVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  };

  const mobileVariants = {
    hidden: { y: '100%', opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  };

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          key={node.id}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={isMobile ? mobileVariants : desktopVariants}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`absolute bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl z-20 overflow-y-auto ${
            isMobile
              ? 'bottom-0 left-0 right-0 max-h-[70vh] rounded-t-2xl'
              : 'top-0 right-0 w-80 h-full rounded-l-xl'
          }`}
        >
          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: NODE_COLOR_MAP[node.type]?.[theme] }}
                />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">
                    {node.label}
                  </h3>
                  {node.meta?.subtitle && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-0.5">
                      {node.meta.subtitle}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Dates */}
            {node.meta?.dates && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                {node.meta.dates}
              </p>
            )}

            {/* Details text */}
            {node.meta?.details && (
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                {node.meta.details}
              </p>
            )}

            {/* Skill items */}
            {node.meta?.items && (
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                {node.meta.items}
              </p>
            )}

            {/* Bullets */}
            {node.meta?.bullets && node.meta.bullets.length > 0 && (
              <ul className="space-y-2 mb-4">
                {node.meta.bullets.map((bullet, i) => (
                  <li
                    key={i}
                    className="text-sm text-slate-500 dark:text-slate-400 flex gap-2"
                  >
                    <span className="text-slate-300 dark:text-slate-600 mt-1.5 flex-shrink-0">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Tags */}
            {node.meta?.tags && node.meta.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {node.meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Essay link */}
            {node.type === 'essay' && node.meta?.slug && onNavigate && (
              <button
                onClick={() => onNavigate(View.ESSAYS, node.meta!.slug)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors w-full justify-center mb-4"
              >
                <BookOpen size={14} />
                {t.graph.readEssay}
              </button>
            )}

            {/* External URL */}
            {node.meta?.url && (
              <a
                href={node.meta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4"
              >
                <ExternalLink size={14} />
                View
              </a>
            )}

            {/* Connected nodes */}
            {connectedNodes.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-1">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  {t.graph.connectedTo}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {connectedNodes.map((cn) => (
                    <span
                      key={cn.id}
                      className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: NODE_COLOR_MAP[cn.type]?.[theme] }}
                      />
                      {cn.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
