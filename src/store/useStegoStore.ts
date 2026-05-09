import { create } from 'zustand';
import { PayloadType } from '../types/crypto';

export interface OperationLog {
  id: string;
  type: 'embed' | 'extract' | 'scan' | 'chat';
  timestamp: number;
  status: 'success' | 'failure';
  details: string;
  payloadType?: PayloadType;
}

const THEME_STORAGE_KEY = 'stegvault-theme';

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

interface StegoState {
  recentLogs: OperationLog[];
  isDeniableMode: boolean;
  securityLevel: 'standard' | 'high' | 'paranoid';
  theme: 'dark' | 'light';
  addLog: (log: Omit<OperationLog, 'id' | 'timestamp'>) => void;
  setDeniableMode: (enabled: boolean) => void;
  setSecurityLevel: (level: 'standard' | 'high' | 'paranoid') => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useStegoStore = create<StegoState>((set) => ({
  recentLogs: [],
  isDeniableMode: false,
  securityLevel: 'high',
  theme: getInitialTheme(),
  addLog: (log) => set((state) => ({
    recentLogs: [
      {
        ...log,
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
      },
      ...state.recentLogs.slice(0, 19), // Keep last 20
    ]
  })),
  setDeniableMode: (enabled) => set({ isDeniableMode: enabled }),
  setSecurityLevel: (level) => set({ securityLevel: level }),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }

    set({ theme });
  },
}));
