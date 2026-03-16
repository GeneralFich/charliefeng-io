import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'content');

export interface CaseStudyMeta {
  slug: string;
  title: string;
  company: string;
  role: string;
  dates: string;
  teamSize?: string;
  metrics: { label: string; value: string }[];
  tags: string[];
  skills: string[];
}

export interface EssayMeta {
  slug: string;
  title: string;
  date: string;
  author: string;
  description: string;
  readTime: number;
  tags: string[];
  featured?: boolean;
  relatedSlugs?: string[];
}

export interface ArtifactMeta {
  slug: string;
  title: string;
  type: string;
  description: string;
  readTime: number;
  context?: string;
}

function getMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'));
}

function readMdxFile(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  return { data, content };
}

// ── Case Studies ──

export function getAllCaseStudies(locale: string = 'en'): CaseStudyMeta[] {
  const dir = path.join(contentDir, 'case-studies', locale);
  const files = getMdxFiles(dir);

  return files.map((file) => {
    const { data } = readMdxFile(path.join(dir, file));
    return {
      slug: file.replace('.mdx', ''),
      ...data,
    } as CaseStudyMeta;
  });
}

export function getCaseStudy(slug: string, locale: string = 'en') {
  const filePath = path.join(contentDir, 'case-studies', locale, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = readMdxFile(filePath);
  return {
    meta: { slug, ...data } as CaseStudyMeta,
    content,
  };
}

// ── Essays ──

export function getAllEssays(locale: string = 'en'): EssayMeta[] {
  const dir = path.join(contentDir, 'essays', locale);
  const files = getMdxFiles(dir);

  return files
    .map((file) => {
      const { data } = readMdxFile(path.join(dir, file));
      return {
        slug: file.replace('.mdx', ''),
        ...data,
      } as EssayMeta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getEssay(slug: string, locale: string = 'en') {
  const dir = path.join(contentDir, 'essays', locale);
  const filePath = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = readMdxFile(filePath);
  return {
    meta: { slug, ...data } as EssayMeta,
    content,
  };
}

// ── Artifacts ──

export function getAllArtifacts(locale: string = 'en'): ArtifactMeta[] {
  const dir = path.join(contentDir, 'artifacts', locale);
  const files = getMdxFiles(dir);

  return files.map((file) => {
    const { data } = readMdxFile(path.join(dir, file));
    return {
      slug: file.replace('.mdx', ''),
      ...data,
    } as ArtifactMeta;
  });
}

export function getArtifact(slug: string, locale: string = 'en') {
  const dir = path.join(contentDir, 'artifacts', locale);
  const filePath = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = readMdxFile(filePath);
  return {
    meta: { slug, ...data } as ArtifactMeta,
    content,
  };
}
