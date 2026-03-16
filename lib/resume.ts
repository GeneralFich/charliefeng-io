import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Experience {
  company: string;
  role: string;
  dates: string;
  bullets: string[];
}

export interface Education {
  school: string;
  degree: string;
  details: string;
}

export interface Leadership {
  organization: string;
  role: string;
  dates: string;
  details: string;
}

export interface SkillCategory {
  category: string;
  items: string;
}

export interface ResumeData {
  name: string;
  title: string;
  location: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  leadership: Leadership[];
  skills: SkillCategory[];
}

export function getResumeData(locale: string = 'en'): ResumeData {
  const suffix = locale === 'zh' ? '.zh' : '';
  const filePath = path.join(process.cwd(), 'content', `resume${suffix}.md`);

  if (!fs.existsSync(filePath)) {
    // Fallback to English
    const fallback = path.join(process.cwd(), 'content', 'resume.md');
    const raw = fs.readFileSync(fallback, 'utf-8');
    return matter(raw).data as ResumeData;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  return matter(raw).data as ResumeData;
}

// Narrative view: group experience bullets by PM capability
export interface NarrativeSection {
  capability: string;
  capabilityKey: string;
  evidence: { text: string; source: string }[];
}

export function getNarrativeSections(data: ResumeData): NarrativeSection[] {
  return [
    {
      capability: 'Product Strategy & Vision',
      capabilityKey: 'strategy',
      evidence: [
        { text: data.experience[0].bullets[0], source: 'Google' }, // $50M Climate Intelligence
        { text: data.experience[1].bullets[0], source: 'Amazon' }, // Rivian integration strategy
      ],
    },
    {
      capability: 'Platform & Infrastructure Products',
      capabilityKey: 'platform',
      evidence: [
        { text: data.experience[0].bullets[1], source: 'Google' }, // Agentic AI platform
        { text: data.experience[0].bullets[2], source: 'Google' }, // Data & ML Ops roadmap
      ],
    },
    {
      capability: 'AI/ML Product Development',
      capabilityKey: 'ai',
      evidence: [
        { text: data.experience[0].bullets[1], source: 'Google' }, // Agentic AI platform
        { text: data.experience[0].bullets[0], source: 'Google' }, // Predictive load / Climate Intelligence
      ],
    },
    {
      capability: 'Scaling & Operations',
      capabilityKey: 'scaling',
      evidence: [
        { text: data.experience[1].bullets[0], source: 'Amazon' }, // Rivian 4→100+
        { text: data.experience[1].bullets[1], source: 'Amazon' }, // Observability as a Service
      ],
    },
    {
      capability: 'Cross-functional Leadership',
      capabilityKey: 'leadership',
      evidence: [
        { text: data.experience[0].bullets[3], source: 'Google' }, // 50+ stakeholders
        { text: data.experience[2].bullets[1], source: 'EY' }, // Teams of 19
      ],
    },
  ];
}
