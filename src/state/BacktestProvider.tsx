import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BacktestResult, SavedStrategy, StrategyConfig } from "@/types";
import { runBacktest as runBacktestService } from "@/data/mockDataService";
import { SEED_STRATEGIES } from "@/features/backtest/strategyPresets";

const STORAGE_KEY = "edge-terminal:v1";
const MAX_RECENT_RESULTS = 40;

interface State {
  hydrated: boolean;
  strategies: SavedStrategy[];
  recentResults: BacktestResult[];
}

type Action =
  | { type: "HYDRATE"; payload: Partial<State> }
  | { type: "UPSERT_STRATEGY"; payload: SavedStrategy }
  | { type: "DELETE_STRATEGY"; payload: { id: string } }
  | { type: "ADD_RESULT"; payload: { result: BacktestResult; strategyId?: string } };

const initialState: State = {
  hydrated: false,
  strategies: [],
  recentResults: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload, hydrated: true };
    case "UPSERT_STRATEGY": {
      const exists = state.strategies.some((s) => s.config.id === action.payload.config.id);
      const strategies = exists
        ? state.strategies.map((s) => (s.config.id === action.payload.config.id ? action.payload : s))
        : [action.payload, ...state.strategies];
      return { ...state, strategies };
    }
    case "DELETE_STRATEGY":
      return { ...state, strategies: state.strategies.filter((s) => s.config.id !== action.payload.id) };
    case "ADD_RESULT": {
      const recentResults = [action.payload.result, ...state.recentResults].slice(0, MAX_RECENT_RESULTS);
      let strategies = state.strategies;
      if (action.payload.strategyId) {
        strategies = strategies.map((s) =>
          s.config.id === action.payload.strategyId ? { ...s, lastResult: action.payload.result } : s
        );
      }
      return { ...state, recentResults, strategies };
    }
    default:
      return state;
  }
}

interface Ctx extends State {
  saveStrategy: (config: StrategyConfig) => void;
  deleteStrategy: (id: string) => void;
  runAndRecord: (config: StrategyConfig, opts?: { persistToStrategy?: boolean }) => Promise<BacktestResult>;
  getResultById: (id: string) => BacktestResult | undefined;
  getStrategyById: (id: string) => SavedStrategy | undefined;
}

const BacktestContext = createContext<Ctx | null>(null);

export function BacktestProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          dispatch({ type: "HYDRATE", payload: parsed });
        } else {
          dispatch({ type: "HYDRATE", payload: { strategies: SEED_STRATEGIES } });
        }
      } catch {
        dispatch({ type: "HYDRATE", payload: { strategies: SEED_STRATEGIES } });
      }
    })();
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ strategies: state.strategies, recentResults: state.recentResults })
    ).catch(() => {});
  }, [state.hydrated, state.strategies, state.recentResults]);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      saveStrategy: (config) => dispatch({ type: "UPSERT_STRATEGY", payload: { config, lastResult: null } }),
      deleteStrategy: (id) => dispatch({ type: "DELETE_STRATEGY", payload: { id } }),
      runAndRecord: async (config, opts) => {
        const result = await runBacktestService(config);
        dispatch({
          type: "ADD_RESULT",
          payload: { result, strategyId: opts?.persistToStrategy === false ? undefined : config.id },
        });
        return result;
      },
      getResultById: (id) => state.recentResults.find((r) => r.id === id),
      getStrategyById: (id) => state.strategies.find((s) => s.config.id === id),
    }),
    [state]
  );

  return <BacktestContext.Provider value={value}>{children}</BacktestContext.Provider>;
}

export function useBacktestStore() {
  const ctx = useContext(BacktestContext);
  if (!ctx) throw new Error("useBacktestStore must be used within BacktestProvider");
  return ctx;
}
