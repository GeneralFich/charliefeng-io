export enum View {
  HOME = 'HOME',
  DASHBOARD = 'DASHBOARD',
  ABOUT = 'ABOUT',
  ESSAYS = 'ESSAYS',
}

export interface RelevantChunk {
  text: string;
  title: string;
  url: string;
  score: number;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  relevantChunks?: RelevantChunk[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  description?: string;
  fill?: string;
}

export interface TimelineDataPoint {
  year: number;
  label: string;
  intensity: number; // For visualization height
}
