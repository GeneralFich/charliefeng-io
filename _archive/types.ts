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
  /** Stable ID used to target background translation updates without ambiguity. */
  id?: string;
  /**
   * Keyed by Language enum value (e.g. 'en', 'zh').
   * Model messages get the primary-language response stored here after streaming,
   * and the alternate language filled in by a silent background API call so that
   * toggling the language switcher immediately shows the correct response.
   * User messages are never translated — they stay in the language they were typed.
   */
  translations?: Partial<Record<string, string>>;
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
