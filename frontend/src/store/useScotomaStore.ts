/** Global state management using Zustand for SCOTOMA app state. */

import { create } from 'zustand';
import { Analysis, ScreenState, Session } from '../types';

interface ScotomaState {
  currentScreen: ScreenState;
  sessionId: string | null;
  session: Session | null;
  analyses: Analysis[];
  latestAnalysis: Analysis | null;
  selectedQuote: string | null;
  hoveredLens: string | null;
  isLoading: boolean;
  error: string | null;

  setScreen: (screen: ScreenState) => void;
  setSessionId: (id: string) => void;
  setSessionData: (session: Session, analyses: Analysis[]) => void;
  addAnalysis: (analysis: Analysis) => void;
  setSelectedQuote: (quote: string | null) => void;
  setHoveredLens: (lens: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}

export const useScotomaStore = create<ScotomaState>((set) => ({
  currentScreen: 'landing',
  sessionId: null,
  session: null,
  analyses: [],
  latestAnalysis: null,
  selectedQuote: null,
  hoveredLens: null,
  isLoading: false,
  error: null,

  setScreen: (screen) => set({ currentScreen: screen }),
  setSessionId: (id) => set({ sessionId: id }),
  setSessionData: (session, analyses) =>
    set({
      session,
      analyses,
      latestAnalysis: analyses.length > 0 ? analyses[analyses.length - 1] : null,
    }),
  addAnalysis: (analysis) =>
    set((state) => ({
      analyses: [...state.analyses, analysis],
      latestAnalysis: analysis,
    })),
  setSelectedQuote: (quote) => set({ selectedQuote: quote }),
  setHoveredLens: (lens) => set({ hoveredLens: lens }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (err) => set({ error: err }),
  reset: () =>
    set({
      currentScreen: 'landing',
      sessionId: null,
      session: null,
      analyses: [],
      latestAnalysis: null,
      selectedQuote: null,
      hoveredLens: null,
      isLoading: false,
      error: null,
    }),
}));
