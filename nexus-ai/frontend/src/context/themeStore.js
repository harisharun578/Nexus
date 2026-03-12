import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const THEMES = [
  { id:'neon',      name:'Neon AI',       icon:'⚡', desc:'Electric green cyberpunk' },
  { id:'aurora',    name:'Glass Aurora',  icon:'🌌', desc:'Purple aurora glass' },
  { id:'cyberpunk', name:'Cyberpunk',     icon:'🔴', desc:'Red neon dystopia' },
  { id:'corporate', name:'Corporate',     icon:'💼', desc:'Enterprise blue' },
  { id:'arctic',    name:'Arctic',        icon:'❄️', desc:'Clean white minimal' },
];

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'neon',
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      }
    }),
    { name: 'nexus-theme' }
  )
);
