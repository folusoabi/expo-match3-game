import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BankrollTransaction, BetSlipSelection, BetStatus, PlacedBet } from "@/types";
import { getMatchById } from "@/data/mock/eventGenerator";
import { settleSelection } from "@/data/mock/oddsEngine";

const STORAGE_KEY = "rewind:v1";
export const STARTING_BALANCE = 5000;
const DEFAULT_EXPLORE_DATE = "2023-09-17";

interface State {
  hydrated: boolean;
  balance: number;
  transactions: BankrollTransaction[];
  slip: BetSlipSelection[];
  bets: PlacedBet[];
  favouriteTeamIds: string[];
  exploreDate: string;
}

type Action =
  | { type: "HYDRATE"; payload: Partial<State> }
  | { type: "TOGGLE_SLIP_SELECTION"; payload: BetSlipSelection }
  | { type: "REMOVE_SLIP_SELECTION"; payload: { id: string } }
  | { type: "CLEAR_SLIP" }
  | { type: "PLACE_BETS"; payload: { bets: PlacedBet[]; transactions: BankrollTransaction[]; newBalance: number } }
  | { type: "REVEAL_BET"; payload: { betId: string } }
  | { type: "TOGGLE_FAVOURITE_TEAM"; payload: { teamId: string } }
  | { type: "SET_EXPLORE_DATE"; payload: { date: string } }
  | { type: "RESET_ALL" };

const initialState: State = {
  hydrated: false,
  balance: STARTING_BALANCE,
  transactions: [],
  slip: [],
  bets: [],
  favouriteTeamIds: [],
  exploreDate: DEFAULT_EXPLORE_DATE,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload, hydrated: true };

    case "TOGGLE_SLIP_SELECTION": {
      const incoming = action.payload;
      const existingSameSelection = state.slip.find(
        (s) =>
          s.matchId === incoming.matchId &&
          s.marketId === incoming.marketId &&
          s.selectionKey === incoming.selectionKey &&
          s.line === incoming.line
      );
      if (existingSameSelection) {
        return { ...state, slip: state.slip.filter((s) => s.id !== existingSameSelection.id) };
      }
      // Only one active selection per match at a time, like a real bet slip.
      const withoutSameMatch = state.slip.filter((s) => s.matchId !== incoming.matchId);
      return { ...state, slip: [...withoutSameMatch, incoming] };
    }

    case "REMOVE_SLIP_SELECTION":
      return { ...state, slip: state.slip.filter((s) => s.id !== action.payload.id) };

    case "CLEAR_SLIP":
      return { ...state, slip: [] };

    case "PLACE_BETS":
      return {
        ...state,
        bets: [...action.payload.bets, ...state.bets],
        transactions: [...action.payload.transactions, ...state.transactions],
        balance: action.payload.newBalance,
        slip: [],
      };

    case "REVEAL_BET": {
      const bet = state.bets.find((b) => b.id === action.payload.betId);
      if (!bet || bet.status !== "pending") return state;

      const results: BetStatus[] = bet.selections.map((sel) => {
        const match = getMatchById(sel.matchId);
        if (!match) return "lost";
        return settleSelection({ match, marketId: sel.marketId, selection: sel.selectionKey, line: sel.line });
      });
      const allWon = results.every((r) => r === "won");
      const status: BetStatus = allWon ? "won" : "lost";
      const profit = allWon ? Math.round((bet.potentialReturn - bet.stake) * 100) / 100 : -bet.stake;
      const settledAt = new Date().toISOString();

      const newBalance = allWon ? Math.round((state.balance + bet.potentialReturn) * 100) / 100 : state.balance;
      const transactions = allWon
        ? [
            {
              id: `txn-payout-${bet.id}`,
              type: "payout" as const,
              amount: bet.potentialReturn,
              balanceAfter: newBalance,
              betId: bet.id,
              createdAt: settledAt,
            },
            ...state.transactions,
          ]
        : state.transactions;

      return {
        ...state,
        balance: newBalance,
        transactions,
        bets: state.bets.map((b) => (b.id === bet.id ? { ...b, status, profit, settledAt } : b)),
      };
    }

    case "TOGGLE_FAVOURITE_TEAM": {
      const has = state.favouriteTeamIds.includes(action.payload.teamId);
      return {
        ...state,
        favouriteTeamIds: has
          ? state.favouriteTeamIds.filter((id) => id !== action.payload.teamId)
          : [...state.favouriteTeamIds, action.payload.teamId],
      };
    }

    case "SET_EXPLORE_DATE":
      return { ...state, exploreDate: action.payload.date };

    case "RESET_ALL":
      return { ...initialState, hydrated: true };

    default:
      return state;
  }
}

interface Ctx extends State {
  toggleSlipSelection: (selection: BetSlipSelection) => void;
  removeSlipSelection: (id: string) => void;
  clearSlip: () => void;
  placeAccumulator: (stake: number) => void;
  placeSingles: (stakesBySelectionId: Record<string, number>) => void;
  revealBet: (betId: string) => void;
  toggleFavouriteTeam: (teamId: string) => void;
  setExploreDate: (date: string) => void;
  resetAll: () => void;
  getBetById: (id: string) => PlacedBet | undefined;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        dispatch({ type: "HYDRATE", payload: raw ? JSON.parse(raw) : {} });
      } catch {
        dispatch({ type: "HYDRATE", payload: {} });
      }
    })();
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    const { hydrated, ...persisted } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)).catch(() => {});
  }, [state]);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      toggleSlipSelection: (selection) => dispatch({ type: "TOGGLE_SLIP_SELECTION", payload: selection }),
      removeSlipSelection: (id) => dispatch({ type: "REMOVE_SLIP_SELECTION", payload: { id } }),
      clearSlip: () => dispatch({ type: "CLEAR_SLIP" }),

      placeAccumulator: (stake) => {
        if (state.slip.length === 0 || stake <= 0 || stake > state.balance) return;
        const combinedOdds = state.slip.reduce((acc, s) => acc * s.odds, 1);
        const potentialReturn = Math.round(stake * combinedOdds * 100) / 100;
        const bet: PlacedBet = {
          id: `bet-${Date.now()}`,
          kind: state.slip.length > 1 ? "accumulator" : "single",
          placedAt: new Date().toISOString(),
          selections: state.slip,
          combinedOdds: Math.round(combinedOdds * 100) / 100,
          stake,
          potentialReturn,
          status: "pending",
        };
        const newBalance = Math.round((state.balance - stake) * 100) / 100;
        const txn: BankrollTransaction = {
          id: `txn-stake-${bet.id}`,
          type: "stake",
          amount: -stake,
          balanceAfter: newBalance,
          betId: bet.id,
          createdAt: bet.placedAt,
        };
        dispatch({ type: "PLACE_BETS", payload: { bets: [bet], transactions: [txn], newBalance } });
      },

      placeSingles: (stakesBySelectionId) => {
        const entries = state.slip.filter((s) => (stakesBySelectionId[s.id] ?? 0) > 0);
        if (entries.length === 0) return;
        const totalStake = entries.reduce((sum, s) => sum + (stakesBySelectionId[s.id] ?? 0), 0);
        if (totalStake > state.balance) return;

        const placedAt = new Date().toISOString();
        let runningBalance = state.balance;
        const bets: PlacedBet[] = [];
        const transactions: BankrollTransaction[] = [];

        for (const sel of entries) {
          const stake = stakesBySelectionId[sel.id];
          const potentialReturn = Math.round(stake * sel.odds * 100) / 100;
          const bet: PlacedBet = {
            id: `bet-${Date.now()}-${sel.id}`,
            kind: "single",
            placedAt,
            selections: [sel],
            combinedOdds: sel.odds,
            stake,
            potentialReturn,
            status: "pending",
          };
          runningBalance = Math.round((runningBalance - stake) * 100) / 100;
          bets.push(bet);
          transactions.push({
            id: `txn-stake-${bet.id}`,
            type: "stake",
            amount: -stake,
            balanceAfter: runningBalance,
            betId: bet.id,
            createdAt: placedAt,
          });
        }

        dispatch({ type: "PLACE_BETS", payload: { bets, transactions, newBalance: runningBalance } });
      },

      revealBet: (betId) => dispatch({ type: "REVEAL_BET", payload: { betId } }),
      toggleFavouriteTeam: (teamId) => dispatch({ type: "TOGGLE_FAVOURITE_TEAM", payload: { teamId } }),
      setExploreDate: (date) => dispatch({ type: "SET_EXPLORE_DATE", payload: { date } }),
      resetAll: () => dispatch({ type: "RESET_ALL" }),
      getBetById: (id) => state.bets.find((b) => b.id === id),
    }),
    [state]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
