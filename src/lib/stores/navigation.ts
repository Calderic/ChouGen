import { create } from 'zustand';

type NavigationState = {
  pendingCount: number;
  start: () => void;
  stop: () => void;
};

export const useNavigationStore = create<NavigationState>(set => ({
  pendingCount: 0,
  start: () => set(s => ({ pendingCount: s.pendingCount + 1 })),
  stop: () => set(s => ({ pendingCount: Math.max(0, s.pendingCount - 1) })),
}));
