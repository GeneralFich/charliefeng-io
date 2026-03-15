import { Language } from '../types';
import { getResumeAttributes, getPosts } from './knowledge';
import graphDataJson from '../content/graph-data.json';

export type NodeType = 'hub' | 'role' | 'skill' | 'project' | 'education' | 'essay' | 'topic' | 'leadership';

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  labelZh?: string;
  radius: number;
  meta?: {
    subtitle?: string;
    subtitleZh?: string;
    dates?: string;
    bullets?: string[];
    slug?: string;
    tags?: string[];
    items?: string;
    details?: string;
    url?: string;
  };
}

export interface GraphEdge {
  source: string;
  target: string;
  strength?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const NODE_COLOR_MAP: Record<NodeType, { light: string; dark: string }> = {
  hub:        { light: '#2563eb', dark: '#60a5fa' },
  role:       { light: '#1e293b', dark: '#cbd5e1' },
  skill:      { light: '#0d9488', dark: '#2dd4bf' },
  project:    { light: '#d97706', dark: '#fbbf24' },
  education:  { light: '#64748b', dark: '#94a3b8' },
  essay:      { light: '#7c3aed', dark: '#a78bfa' },
  topic:      { light: '#0891b2', dark: '#22d3ee' },
  leadership: { light: '#64748b', dark: '#94a3b8' },
};

export function getGraphData(lang: Language): GraphData {
  const raw = graphDataJson as GraphData;
  const resume = getResumeAttributes(lang);
  const posts = getPosts(lang);

  const nodes: GraphNode[] = raw.nodes.map((node) => {
    const n = { ...node };

    // Overlay language-specific labels
    if (lang === Language.ZH && n.labelZh) {
      n.label = n.labelZh;
    }

    // Overlay essay titles and metadata from blog posts
    if (n.type === 'essay' && n.meta?.slug) {
      const post = posts.find((p) => p.slug === n.meta!.slug);
      if (post) {
        n.label = post.attributes.title;
        n.meta = {
          ...n.meta,
          tags: post.tags,
        };
      }
    }

    // Overlay role data from resume
    if (n.type === 'role') {
      const exp = resume.experience.find(
        (e) => e.company.toLowerCase().includes(n.id.replace('role-', '').toLowerCase())
      );
      if (exp) {
        if (lang === Language.ZH && n.meta?.subtitleZh) {
          n.meta = { ...n.meta, subtitle: n.meta.subtitleZh };
        } else {
          n.meta = { ...n.meta, subtitle: exp.role, dates: exp.dates };
        }
      }
    }

    // Overlay education data from resume
    if (n.type === 'education') {
      const edu = resume.education.find(
        (e) => e.school.toLowerCase().includes(n.id === 'edu-yale' ? 'yale' : 'new york')
      );
      if (edu) {
        n.meta = { ...n.meta, subtitle: edu.degree, details: edu.details };
      }
    }

    // Overlay skill data from resume
    if (n.type === 'skill') {
      const skillMap: Record<string, string> = {
        'skill-product-strategy': 'product strategy',
        'skill-ai-infra': 'ai & compute',
        'skill-data-stack': 'data & technical',
      };
      const searchTerm = skillMap[n.id];
      if (searchTerm) {
        const skill = resume.skills.find(
          (s) => s.category.toLowerCase().includes(searchTerm)
        );
        if (skill) {
          n.meta = { ...n.meta, items: skill.items };
          if (lang === Language.EN) {
            n.label = skill.category;
          }
        }
      }
    }

    return n;
  });

  return { nodes, edges: raw.edges };
}

/** Hash-to-node mapping for deep-link compatibility */
export const HASH_TO_NODE: Record<string, string> = {
  '#summary': 'hub-charlie',
  '#experience': 'role-google',
  '#education': 'edu-yale',
  '#leadership': 'leadership-yale',
  '#skills': 'skill-product-strategy',
};
