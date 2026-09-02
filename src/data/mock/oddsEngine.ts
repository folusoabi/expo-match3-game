import type { BetStatus, Match, MarketId, SelectionKey } from "@/types";
import { seededRng, randFloat } from "@/utils/seededRandom";

export interface PricingInput {
  match: Match;
  marketId: MarketId;
  selection: SelectionKey;
  line?: number;
}

/** Fair (no-margin) win probability estimate — drives odds pricing only, never shown to the user directly. */
function fairProbability({ match, marketId, selection, line }: PricingInput): number {
  const homeFav = match.isHomeFavourite;

  switch (marketId) {
    case "match_result": {
      if (selection === "Draw") return 0.24;
      const favWins = 0.46;
      const dogWins = 0.3;
      return (selection === "Home") === homeFav ? favWins : dogWins;
    }
    case "draw_no_bet":
    case "moneyline":
    case "match_winner":
      return (selection === "Home") === homeFav ? 0.58 : 0.42;
    case "btts":
      return selection === "Yes" ? 0.52 : 0.48;
    case "asian_handicap":
    case "spread":
    case "puck_line": {
      const favSide = (selection === "Home") === homeFav;
      const l = line ?? 0;
      const steep = Math.min(0.85, 0.5 + Math.abs(l) * 0.03 + (favSide ? 0.06 : -0.06));
      return favSide ? steep : 1 - steep;
    }
    case "over_under":
    case "total_points":
    case "total_goals_hockey":
    case "total_games":
      return 0.5;
    case "team_total":
      return 0.5;
    case "set_winner":
      return (selection === "Home") === homeFav ? 0.6 : 0.4;
    case "game_handicap":
    case "set_handicap": {
      const l = line ?? 0;
      const favSide = (selection === "Home") === homeFav;
      const steep = Math.min(0.85, 0.5 + Math.abs(l) * 0.02 + (favSide ? 0.05 : -0.05));
      return favSide ? steep : 1 - steep;
    }
    default:
      return 0.5;
  }
}

const HOUSE = "house";

/** Deterministic decimal odds — same match/market/selection/line always prices the same. */
export function getOdds(input: PricingInput): number {
  const prob = fairProbability(input);
  const margin = 1.06;
  const rng = seededRng(`odds:${input.match.id}:${input.marketId}:${input.selection}:${input.line ?? ""}:${HOUSE}`);
  const variance = randFloat(rng, -0.02, 0.02, 3);
  const fairOdds = 1 / Math.min(0.95, Math.max(0.05, prob + variance));
  const priced = fairOdds / margin;
  return Math.max(1.03, Math.round(priced * 100) / 100);
}

function margin(match: Match): number {
  return match.result.homeScore - match.result.awayScore;
}

/** Settles a selection against the match's real result. */
export function settleSelection({ match, marketId, selection, line }: PricingInput): BetStatus {
  const r = match.result;
  const won: BetStatus = "won";
  const lost: BetStatus = "lost";

  switch (marketId) {
    case "match_result": {
      const m = margin(match);
      if (m === 0) return selection === "Draw" ? won : lost;
      if (selection === "Draw") return lost;
      return (selection === "Home") === m > 0 ? won : lost;
    }
    case "draw_no_bet":
    case "moneyline": {
      const m = margin(match);
      if (m === 0) return lost; // treated as void-equivalent loss-return handled by caller for DNB; moneyline ties are rare
      return (selection === "Home") === (m > 0) ? won : lost;
    }
    case "btts": {
      const both = r.homeScore > 0 && r.awayScore > 0;
      return (selection === "Yes") === both ? won : lost;
    }
    case "asian_handicap":
    case "spread":
    case "puck_line": {
      const l = line ?? 0;
      const isHome = selection === "Home";
      const adj = isHome ? margin(match) + l : -margin(match) + l;
      if (adj > 0) return won;
      if (adj < 0) return lost;
      return lost; // push treated as a return-stake case, handled by caller
    }
    case "over_under": {
      const total = r.homeScore + r.awayScore;
      const l = line ?? 0;
      const over = total > l;
      return (selection === "Over") === over ? won : lost;
    }
    case "total_points":
    case "total_goals_hockey": {
      const total = r.homeScore + r.awayScore;
      const l = line ?? 0;
      const over = total > l;
      return (selection === "Over") === over ? won : lost;
    }
    case "team_total": {
      const l = line ?? 0;
      const isHome = selection === "Home";
      const val = isHome ? r.homeScore : r.awayScore;
      const over = val > l;
      return over ? won : lost;
    }
    case "match_winner": {
      const m = margin(match);
      return (selection === "Home") === (m > 0) ? won : lost;
    }
    case "set_winner": {
      const firstSet = r.sets?.[0];
      if (!firstSet) return lost;
      const homeWonFirst = firstSet.home > firstSet.away;
      return (selection === "Home") === homeWonFirst ? won : lost;
    }
    case "game_handicap": {
      if (!r.sets) return lost;
      const gamesHome = r.sets.reduce((s, x) => s + x.home, 0);
      const gamesAway = r.sets.reduce((s, x) => s + x.away, 0);
      const l = line ?? 0;
      const isHome = selection === "Home";
      const adj = isHome ? gamesHome - gamesAway + l : gamesAway - gamesHome + l;
      return adj > 0 ? won : lost;
    }
    case "set_handicap": {
      const l = line ?? 0;
      const isHome = selection === "Home";
      const adj = isHome ? r.homeScore - r.awayScore + l : r.awayScore - r.homeScore + l;
      return adj > 0 ? won : lost;
    }
    case "total_games": {
      const total = r.totalGames ?? 0;
      const l = line ?? 0;
      const over = total > l;
      return (selection === "Over") === over ? won : lost;
    }
    default:
      return lost;
  }
}
