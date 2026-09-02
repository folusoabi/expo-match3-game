import type { Market, SportId } from "@/types";

export const MARKETS: Market[] = [
  {
    id: "match_result",
    name: "Home / Draw / Away",
    sportIds: ["football"],
    selections: ["Home", "Draw", "Away"],
    hasLine: false,
  },
  {
    id: "draw_no_bet",
    name: "Draw No Bet",
    sportIds: ["football"],
    selections: ["Home", "Away"],
    hasLine: false,
  },
  {
    id: "btts",
    name: "Both Teams To Score",
    sportIds: ["football"],
    selections: ["Yes", "No"],
    hasLine: false,
  },
  {
    id: "asian_handicap",
    name: "Asian Handicap",
    sportIds: ["football"],
    selections: ["Home", "Away"],
    hasLine: true,
    defaultLines: [-1.5, -1, -0.5, 0, 0.5, 1, 1.5],
  },
  {
    id: "over_under",
    name: "Over / Under",
    sportIds: ["football", "basketball", "hockey"],
    selections: ["Over", "Under"],
    hasLine: true,
    defaultLines: [1.5, 2, 2.5, 3, 3.5],
  },
  {
    id: "moneyline",
    name: "Moneyline",
    sportIds: ["basketball", "hockey"],
    selections: ["Home", "Away"],
    hasLine: false,
  },
  {
    id: "spread",
    name: "Spread / Puck Line",
    sportIds: ["basketball", "hockey"],
    selections: ["Home", "Away"],
    hasLine: true,
    defaultLines: [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5],
  },
  {
    id: "team_total",
    name: "Team Total",
    sportIds: ["basketball", "hockey"],
    selections: ["Home Over", "Home Under", "Away Over", "Away Under"],
    hasLine: true,
    defaultLines: [1.5, 2.5, 99.5, 105.5],
  },
  {
    id: "match_winner",
    name: "Match Winner",
    sportIds: ["tennis"],
    selections: ["Favourite", "Underdog"],
    hasLine: false,
  },
  {
    id: "set_winner",
    name: "1st Set Winner",
    sportIds: ["tennis"],
    selections: ["Favourite", "Underdog"],
    hasLine: false,
  },
  {
    id: "game_handicap",
    name: "Game Handicap",
    sportIds: ["tennis"],
    selections: ["Favourite", "Underdog"],
    hasLine: true,
    defaultLines: [-4.5, -2.5, 2.5, 4.5],
  },
  {
    id: "set_handicap",
    name: "Set Handicap",
    sportIds: ["tennis"],
    selections: ["Favourite", "Underdog"],
    hasLine: true,
    defaultLines: [-1.5, 1.5],
  },
  {
    id: "total_games",
    name: "Total Games",
    sportIds: ["tennis"],
    selections: ["Over", "Under"],
    hasLine: true,
    defaultLines: [20.5, 22.5, 24.5],
  },
];

export function marketsForSport(sportId: SportId): Market[] {
  return MARKETS.filter((m) => m.sportIds.includes(sportId));
}

export function getMarket(id: string): Market | undefined {
  return MARKETS.find((m) => m.id === id);
}
