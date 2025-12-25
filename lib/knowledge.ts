/**
 * @fileoverview Knowledge Base & Data Layer
 *
 * This module serves as the "Single Source of Truth" for the application's content
 * and the AI's context. It bridges the static Markdown files in `content/` with
 * the runtime React application and the Gemini LLM.
 *
 * Key Responsibilities:
 * 1. **Content Loading**: Uses Vite's `?raw` suffix to import Markdown files as strings at build time.
 * 2. **Structure Parsing**: Uses `front-matter` to extract YAML metadata (attributes) from the Markdown body.
 * 3. **Dynamic Blog Indexing**: Uses `import.meta.glob` to automatically discover and load all blog posts
 *    without manual registration.
 * 4. **AI Persona Construction**: Aggregates the Resume, Whitepaper, and Blog Index into a single
 *    `FULL_CONTEXT` system prompt that defines the "Charlie Feng" digital twin persona.
 *
 * @see {@link https://vitejs.dev/guide/features.html#glob-import Vite Glob Import}
 * @see {@link https://github.com/jxson/front-matter Front Matter Library}
 */

import fm from 'front-matter';
import resumeRaw from '../content/resume.md?raw';
import { calculateReadTime } from './utils';

// --- Interfaces for Parsed Data ---

export interface ExperienceItem {
  company: string;
  role: string;
  dates: string;
  bullets: string[];
}

export interface EducationItem {
  school: string;
  degree: string;
  details: string;
}

export interface LeadershipItem {
  organization: string;
  role: string;
  dates: string;
  details: string;
}

export interface SkillCategory {
  category: string;
  items: string;
}

export interface ResumeAttributes {
  name: string;
  title: string;
  location: string;
  // email: string; // Removed for PII protection
  // phone: string; // Removed for PII protection
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  leadership: LeadershipItem[];
  skills: SkillCategory[];
}

export interface PostAttributes {
  title: string;
  date: string;
  author: string;
  description: string;
}

export interface BlogPost {
  slug: string;
  attributes: PostAttributes;
  body: string;
  readTime: number;
}

// --- Parsing ---

const parsedResume = fm<ResumeAttributes>(resumeRaw);

export const RESUME_CONTENT = parsedResume.attributes;

// --- Blog Posts ---
const postFiles = import.meta.glob('../content/posts/*.md', { query: '?raw', import: 'default', eager: true });

export const BLOG_POSTS: BlogPost[] = Object.entries(postFiles).map(([path, content]) => {
  const parsed = fm<PostAttributes>(content as string);
  const slug = path.split('/').pop()?.replace('.md', '') || '';
  return {
    slug,
    attributes: parsed.attributes,
    body: parsed.body,
    readTime: calculateReadTime(parsed.body),
  };
}).sort((a, b) => new Date(b.attributes.date).getTime() - new Date(a.attributes.date).getTime());

// --- Raw Data for LLM Context ---
// We pass the raw markdown (including frontmatter) so the LLM sees the structured data as well.
export const RESUME_DATA = resumeRaw;

export const FULL_CONTEXT = `
You are the AI Digital Twin of Charlie Feng. You are acting as Charlie Feng for the purposes of this chat.
Your persona is a "Strategic Thought Partner" and an Infrastructure Product Leader at Google.
You are concise, data-driven, futuristic, and professional.
You have an "Conductor" aesthetic in your tone—precise, orchestrating complex ideas into clear narratives.

Here is your Resume:
${RESUME_DATA}

Here is a list of your Blog Essays:
${BLOG_POSTS.map(p => `- [${p.attributes.date}] ${p.attributes.title} (Slug: ${p.slug}): ${p.attributes.description}`).join('\n')}

INSTRUCTIONS:
1. Prioritize the provided Context Data (Resume & Manifesto) for your answers.
2. If asked about your background, summarize from the Resume.
3. If asked about AGI, future trends, or economics, cite the relevant essays from the blog list (e.g. "The Asymptotic Trajectory").
4. If asked about something outside the provided context, you may answer using your general knowledge. However, you must maintain your persona as Charlie Feng: answer through the lens of an Infrastructure Product Leader and Strategic Thought Partner. Be professional, data-driven, and forward-looking.
5. Keep answers insightful but under 200 words unless requested otherwise.
6. **Linking to Content**:
   - When referencing the Whitepaper/Dashboard, refer to it as the "Whitepaper Essay" and link to: \[Whitepaper\](/essays/strategic-whitepaper).
   - When referencing a specific Essay, use the link format: \[Essay Title\](/essays/SLUG). Use the slug provided in the Blog Essays list above.
   - When referencing your Background/Resume, use the link format: \[Resume\](/resume).
7. At the very end of your response, you MUST provide 3 follow-up questions that the user might want to ask next. Format them strictly as a JSON array on a new line, like this:
[FOLLOW_UP] ["Question 1", "Question 2", "Question 3"]
`;
