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

  // Optimization: Pre-index posts into a Map for O(1) lookup within the nodes loop
  const postMap = new Map(posts.map((p) => [p.slug, p]));

  // Optimization: Cache lowercase entries for resume lookups
  const experienceEntries = resume.experience.map(e => ({
    lowerCompany: e.company.toLowerCase(),
    data: e
  }));
  const educationEntries = resume.education.map(e => ({
    lowerSchool: e.school.toLowerCase(),
    data: e
  }));
  const skillMapRes = new Map(resume.skills.map(s => [s.category.toLowerCase(), s]));

  const skillIdMap: Record<string, string> = {
    'skill-product-strategy': 'product strategy',
    'skill-ai-infra': 'ai & compute',
    'skill-data-stack': 'data & technical',
  };

  const nodes: GraphNode[] = raw.nodes.map((node) => {
    const n = { ...node };

    // Overlay language-specific labels
    if (lang === Language.ZH && n.labelZh) {
      n.label = n.labelZh;
    }

    // Overlay essay titles and metadata from blog posts
    if (n.type === 'essay' && n.meta?.slug) {
      const post = postMap.get(n.meta.slug);
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
      const companyId = n.id.replace('role-', '').toLowerCase();
      const entry = experienceEntries.find(e => e.lowerCompany.includes(companyId));
      if (entry) {
        const exp = entry.data;
        if (lang === Language.ZH && n.meta?.subtitleZh) {
          n.meta = { ...n.meta, subtitle: n.meta.subtitleZh };
        } else {
          n.meta = { ...n.meta, subtitle: exp.role, dates: exp.dates };
        }
      }
    }

    // Overlay education data from resume
    if (n.type === 'education') {
      const schoolSearch = n.id === 'edu-yale' ? 'yale' : 'new york';
      const entry = educationEntries.find(e => e.lowerSchool.includes(schoolSearch));
      if (entry) {
        const edu = entry.data;
        n.meta = { ...n.meta, subtitle: edu.degree, details: edu.details };
      }
    }

    // Overlay skill data from resume
    if (n.type === 'skill') {
      const searchTerm = skillIdMap[n.id];
      if (searchTerm) {
        const skill = skillMapRes.get(searchTerm);
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
