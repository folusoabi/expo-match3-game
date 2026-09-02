import type { Market, SportId } from "@/types";

export const MARKETS: Market[] = [
  {
    id: "match_result",
    name: "Full Time Result",
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
    name: "Total Goals",
    sportIds: ["football"],
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
    name: "Spread",
    sportIds: ["basketball"],
    selections: ["Home", "Away"],
    hasLine: true,
    defaultLines: [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5],
  },
  {
    id: "puck_line",
    name: "Puck Line",
    sportIds: ["hockey"],
    selections: ["Home", "Away"],
    hasLine: true,
    defaultLines: [-1.5, 1.5],
  },
  {
    id: "total_points",
    name: "Total Points",
    sportIds: ["basketball"],
    selections: ["Over", "Under"],
    hasLine: true,
    defaultLines: [205.5, 215.5, 225.5, 235.5],
  },
  {
    id: "total_goals_hockey",
    name: "Total Goals",
    sportIds: ["hockey"],
    selections: ["Over", "Under"],
    hasLine: true,
    defaultLines: [4.5, 5.5, 6.5],
  },
  {
    id: "team_total",
    name: "Team Total",
    sportIds: ["basketball", "hockey"],
    selections: ["Home", "Away"],
    hasLine: true,
    defaultLines: [1.5, 2.5, 99.5, 105.5],
  },
  {
    id: "match_winner",
    name: "Match Winner",
    sportIds: ["tennis"],
    selections: ["Home", "Away"],
    hasLine: false,
  },
  {
    id: "set_winner",
    name: "1st Set Winner",
    sportIds: ["tennis"],
    selections: ["Home", "Away"],
    hasLine: false,
  },
  {
    id: "game_handicap",
    name: "Game Handicap",
    sportIds: ["tennis"],
    selections: ["Home", "Away"],
    hasLine: true,
    defaultLines: [-4.5, -2.5, 2.5, 4.5],
  },
  {
    id: "set_handicap",
    name: "Set Handicap",
    sportIds: ["tennis"],
    selections: ["Home", "Away"],
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
