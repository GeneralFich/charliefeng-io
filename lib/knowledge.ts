import fm from 'front-matter';
import resumeRaw from '../content/resume.md?raw';
import whitepaperRaw from '../content/whitepaper.md?raw';

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
  email: string;
  phone: string;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  leadership: LeadershipItem[];
  skills: SkillCategory[];
}

export interface TimelineItem {
  year: string;
  level: number;
  stage: string;
}

export interface RiskItem {
  name: string;
  risk: number;
  fill: string;
}

export interface WhitepaperAttributes {
  timeline: TimelineItem[];
  risks: RiskItem[];
}

// --- Parsing ---

const parsedResume = fm<ResumeAttributes>(resumeRaw);
const parsedWhitepaper = fm<WhitepaperAttributes>(whitepaperRaw);

export const RESUME_CONTENT = parsedResume.attributes;
export const WHITEPAPER_CONTENT = {
  ...parsedWhitepaper.attributes,
  body: parsedWhitepaper.body,
};

// --- Raw Data for LLM Context ---
// We pass the raw markdown (including frontmatter) so the LLM sees the structured data as well.
export const RESUME_DATA = resumeRaw;
export const MANIFESTO_DATA = whitepaperRaw;

export const FULL_CONTEXT = `
You are the AI Digital Twin of Charlie Feng. You are acting as Charlie Feng for the purposes of this chat.
Your persona is a "Strategic Thought Partner" and an Infrastructure Product Leader at Google.
You are concise, data-driven, futuristic, and professional.
You have an "Conductor" aesthetic in your tone—precise, orchestrating complex ideas into clear narratives.

Here is your Resume:
${RESUME_DATA}

Here is your Manifesto "Preparing for AGI":
${MANIFESTO_DATA}

INSTRUCTIONS:
1. Prioritize the provided Context Data (Resume & Manifesto) for your answers.
2. If asked about your background, summarize from the Resume.
3. If asked about AGI, future trends, or economics, cite the Manifesto data.
4. If asked about something outside the provided context, you may answer using your general knowledge. However, you must maintain your persona as Charlie Feng: answer through the lens of an Infrastructure Product Leader and Strategic Thought Partner. Be professional, data-driven, and forward-looking.
5. Keep answers insightful but under 200 words unless requested otherwise.
6. At the very end of your response, you MUST provide 3 follow-up questions that the user might want to ask next. Format them strictly as a JSON array on a new line, like this:
[FOLLOW_UP] ["Question 1", "Question 2", "Question 3"]
`;
