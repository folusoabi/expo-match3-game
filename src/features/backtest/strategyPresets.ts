import type { SavedStrategy, StrategyConfig } from "@/types";
import { runBacktest } from "./engine";
import { getDatasetRange } from "@/data/mock/eventGenerator";

const range = getDatasetRange();

function baseFilters() {
  return { favourite: "any" as const, homeAway: "any" as const, form: "any" as const, minOdds: 1.01, maxOdds: 20 };
}

const presetConfigs: StrategyConfig[] = [
  {
    id: "seed-metro-over25",
    name: "Metropolitan Over 2.5",
    sportId: "football",
    leagueId: "fb-metro",
    marketId: "over_under",
    selection: "Over",
    line: 2.5,
    bookmaker: "PinPoint",
    dateFrom: range.from,
    dateTo: range.to,
    startingBankroll: 1000,
    stakeType: "percentage",
    stakeValue: 2,
    filters: baseFilters(),
    createdAt: "2026-01-04T09:00:00.000Z",
  },
  {
    id: "seed-nha-home-fav",
    name: "NHA Home Favourite",
    sportId: "basketball",
    leagueId: "bb-national",
    marketId: "moneyline",
    selection: "Home",
    bookmaker: "Meridian Bet",
    dateFrom: range.from,
    dateTo: range.to,
    startingBankroll: 1500,
    stakeType: "fixed",
    stakeValue: 25,
    filters: { ...baseFilters(), favourite: "favourite" },
    createdAt: "2026-02-11T09:00:00.000Z",
  },
  {
    id: "seed-gcm-underdog",
    name: "Grand Circuit Underdog Strategy",
    sportId: "tennis",
    leagueId: "tn-mens",
    marketId: "match_winner",
    selection: "Underdog",
    bookmaker: "OddsForge",
    dateFrom: range.from,
    dateTo: range.to,
    startingBankroll: 800,
    stakeType: "percentage",
    stakeValue: 1.5,
    filters: baseFilters(),
    createdAt: "2026-03-22T09:00:00.000Z",
  },
];

export const SEED_STRATEGIES: SavedStrategy[] = presetConfigs.map((config) => ({
  config,
  lastResult: runBacktest(config),
}));
