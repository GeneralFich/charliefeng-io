import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { GraphNode, GraphEdge, NODE_COLOR_MAP, NodeType } from '../lib/graph-data';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { useTheme } from '../lib/ThemeContext';

interface GraphListFallbackProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode: (nodeId: string) => void;
  selectedNodeId: string | null;
}

const GROUP_ORDER: { type: NodeType; key: string }[] = [
  { type: 'role', key: 'roles' },
  { type: 'project', key: 'projects' },
  { type: 'skill', key: 'skills' },
  { type: 'essay', key: 'essays' },
  { type: 'education', key: 'education' },
  { type: 'leadership', key: 'roles' },
  { type: 'topic', key: 'topics' },
];

export const GraphListFallback: React.FC<GraphListFallbackProps> = ({
  nodes,
  edges,
  onSelectNode,
  selectedNodeId,
}) => {
  const { t } = useLanguage();
  const { resolved: theme } = useTheme();
  const [openSections, setOpenSections] = useState<Set<NodeType>>(
    new Set(['role', 'project', 'skill', 'essay'])
  );

  const toggleSection = (type: NodeType) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const getConnectedLabels = (nodeId: string): string[] => {
    const connectedIds = new Set<string>();
    for (const edge of edges) {
      if (edge.source === nodeId) connectedIds.add(edge.target);
      if (edge.target === nodeId) connectedIds.add(edge.source);
    }
    return nodes
      .filter((n) => connectedIds.has(n.id) && n.type !== 'hub')
      .map((n) => n.label);
  };

  const groupLabel = (key: string): string => {
    const labels: Record<string, string> = {
      roles: t.graph.roles,
      projects: t.graph.projects,
      skills: t.graph.skills,
      essays: t.graph.essays,
      education: t.graph.education,
      topics: t.graph.topics,
    };
    return labels[key] || key;
  };

  // Group nodes, skipping hub
  const grouped = GROUP_ORDER.map(({ type, key }) => ({
    type,
    key,
    nodes: nodes.filter((n) => n.type === type),
  })).filter((g) => g.nodes.length > 0);

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-800">
      {grouped.map(({ type, key, nodes: groupNodes }) => {
        const isOpen = openSections.has(type);
        return (
          <div key={type}>
            <button
              onClick={() => toggleSection(type)}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: NODE_COLOR_MAP[type]?.[theme] }}
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {groupLabel(key)}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {groupNodes.length}
                </span>
              </div>
              {isOpen ? (
                <ChevronDown size={16} className="text-slate-400" />
              ) : (
                <ChevronRight size={16} className="text-slate-400" />
              )}
            </button>

            {isOpen && (
              <div className="pb-2">
                {groupNodes.map((node) => {
                  const connected = getConnectedLabels(node.id);
                  const isSelected = selectedNodeId === node.id;
                  return (
                    <button
                      key={node.id}
                      onClick={() => onSelectNode(node.id)}
                      className={`w-full text-left px-5 py-2.5 pl-10 transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                          {node.label}
                        </span>
                        {node.meta?.subtitle && (
                          <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                            — {node.meta.subtitle}
                          </span>
                        )}
                      </div>
                      {connected.length > 0 && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                          {t.graph.connectedTo}: {connected.slice(0, 4).join(', ')}
                          {connected.length > 4 && ` +${connected.length - 4}`}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
