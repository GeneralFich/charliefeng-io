export enum View {
  HOME = 'HOME',
  DASHBOARD = 'DASHBOARD',
  ABOUT = 'ABOUT',
  ESSAYS = 'ESSAYS',
}

export enum Language {
  EN = 'en',
  ZH = 'zh',
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
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

export type SortOption = 'newest' | 'oldest' | 'shortest' | 'longest';
