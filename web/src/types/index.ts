// Task related types
export interface Task {
  id: string;
  command: string;
  output: string;
  timestamp: number;
  status: 'success' | 'error';
}

// Command related types
export interface CommandState {
  isExecuting: boolean;
  lastCommand: string | null;
  output: string | null;
  error: string | null;
}

// Theme related types
export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Settings related types
export interface Settings {
  autoScroll: boolean;
  maxHistory: number;
  confirmDangerous: boolean;
}

// Message related types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status?: 'pending' | 'complete' | 'error';
}

// API related types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CommandResponse {
  output: string;
  status: 'success' | 'error';
  timestamp: number;
}