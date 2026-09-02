import type { BacktestResult, League, Market, SportId, StrategyConfig } from "@/types";
import { SPORTS, LEAGUES, BOOKMAKERS, leaguesForSport } from "./mock/reference";
import { marketsForSport, getMarket, MARKETS } from "./mock/markets";
import { getDatasetRange } from "./mock/eventGenerator";
import { runBacktest as runBacktestEngine } from "@/features/backtest/engine";

/**
 * This module is the boundary between the UI and "where data comes from".
 * Every function here is async-shaped (returns the value directly today,
 * but call sites already `await` it) so swapping the mock generators for
 * real REST/GraphQL odds & results providers later is a drop-in change —
 * no screen code should need to change.
 */

const NETWORK_DELAY_MS = 0;

function resolveAfter<T>(value: T): Promise<T> {
  if (NETWORK_DELAY_MS <= 0) return Promise.resolve(value);
  return new Promise((res) => setTimeout(() => res(value), NETWORK_DELAY_MS));
}

export async function fetchSports() {
  return resolveAfter(SPORTS);
}

export async function fetchLeagues(sportId?: SportId): Promise<League[]> {
  return resolveAfter(sportId ? leaguesForSport(sportId) : LEAGUES);
}

export async function fetchMarkets(sportId: SportId): Promise<Market[]> {
  return resolveAfter(marketsForSport(sportId));
}

export async function fetchMarketById(id: string) {
  return resolveAfter(getMarket(id) ?? null);
}

export async function fetchAllMarkets() {
  return resolveAfter(MARKETS);
}

export async function fetchBookmakers() {
  return resolveAfter(BOOKMAKERS);
}

export async function fetchDatasetRange() {
  return resolveAfter(getDatasetRange());
}

export async function runBacktest(strategy: StrategyConfig): Promise<BacktestResult> {
  const result = runBacktestEngine(strategy);
  return resolveAfter(result);
}
