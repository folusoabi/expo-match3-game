import type { BetResult, MarketId, SportEvent } from "@/types";
import { seededRng, randFloat } from "@/utils/seededRandom";

interface SettlementInput {
  event: SportEvent;
  marketId: MarketId;
  selection: string;
  line?: number;
}

/** Returns win probability estimate (0-1) used purely to price odds realistically. */
function impliedProbability({ event, marketId, selection, line }: SettlementInput): number {
  const r = event.result;
  const homeFav = event.isHomeFavourite;

  switch (marketId) {
    case "match_result": {
      if (selection === "Draw") return 0.24;
      const favWins = 0.46;
      const dogWins = 0.3;
      return (selection === "Home") === homeFav ? favWins : dogWins;
    }
    case "draw_no_bet":
    case "moneyline": {
      return (selection === "Home") === homeFav ? 0.58 : 0.42;
    }
    case "btts":
      return selection === "Yes" ? 0.52 : 0.48;
    case "asian_handicap":
    case "spread": {
      const favSide = (selection === "Home") === homeFav;
      const l = line ?? 0;
      const steep = Math.min(0.85, 0.5 + Math.abs(l) * 0.03 + (favSide ? 0.06 : -0.06));
      return favSide ? steep : 1 - steep;
    }
    case "over_under":
    case "total_games":
      return selection === "Over" ? 0.5 : 0.5;
    case "team_total":
      return selection.includes("Over") ? 0.5 : 0.5;
    case "match_winner":
      return selection === "Favourite" ? 0.64 : 0.36;
    case "set_winner":
      return selection === "Favourite" ? 0.6 : 0.4;
    case "game_handicap":
    case "set_handicap": {
      const l = line ?? 0;
      const isFav = selection === "Favourite";
      const steep = Math.min(0.85, 0.5 + Math.abs(l) * 0.02 + (isFav ? 0.05 : -0.05));
      return isFav ? steep : 1 - steep;
    }
    default:
      return 0.5;
  }
}

/** Deterministic decimal odds for a given bookmaker (small per-bookmaker variance + margin). */
export function getOdds(input: SettlementInput & { bookmaker: string }): number {
  const prob = impliedProbability(input);
  const margin = 1.06; // ~6% overround
  const rng = seededRng(`odds:${input.event.id}:${input.marketId}:${input.selection}:${input.line ?? ""}:${input.bookmaker}`);
  const bookVariance = randFloat(rng, -0.03, 0.03, 3);
  const fairOdds = 1 / Math.min(0.95, Math.max(0.05, prob + bookVariance));
  const priced = fairOdds / margin;
  return Math.max(1.03, Math.round(priced * 100) / 100);
}

function homeAwayGoalsMargin(event: SportEvent): number {
  return event.result.homeScore - event.result.awayScore;
}

/** Settles whether a selection won, lost, or pushed (void) against the real result. */
export function settleBet({ event, marketId, selection, line }: SettlementInput): BetResult {
  const r = event.result;

  switch (marketId) {
    case "match_result": {
      const margin = homeAwayGoalsMargin(event);
      if (margin === 0) return selection === "Draw" ? "won" : "lost";
      const winnerIsHome = margin > 0;
      if (selection === "Draw") return "lost";
      return (selection === "Home") === winnerIsHome ? "won" : "lost";
    }
    case "draw_no_bet": {
      const margin = homeAwayGoalsMargin(event);
      if (margin === 0) return "void";
      return (selection === "Home") === (margin > 0) ? "won" : "lost";
    }
    case "moneyline": {
      const margin = homeAwayGoalsMargin(event);
      if (margin === 0) return "void";
      return (selection === "Home") === (margin > 0) ? "won" : "lost";
    }
    case "btts": {
      const both = r.homeScore > 0 && r.awayScore > 0;
      return (selection === "Yes") === both ? "won" : "lost";
    }
    case "asian_handicap":
    case "spread": {
      const l = line ?? 0;
      const isHome = selection === "Home";
      const adjMargin = isHome ? homeAwayGoalsMargin(event) + l : -homeAwayGoalsMargin(event) + l;
      if (adjMargin > 0) return "won";
      if (adjMargin < 0) return "lost";
      return "void";
    }
    case "over_under": {
      const total = r.homeScore + r.awayScore;
      const l = line ?? 0;
      if (total === l) return "void";
      const over = total > l;
      return (selection === "Over") === over ? "won" : "lost";
    }
    case "team_total": {
      const l = line ?? 0;
      const isHome = selection.startsWith("Home");
      const val = isHome ? r.homeScore : r.awayScore;
      if (val === l) return "void";
      const over = val > l;
      const wantsOver = selection.endsWith("Over");
      return wantsOver === over ? "won" : "lost";
    }
    case "match_winner": {
      const favWon = event.isHomeFavourite ? r.homeScore > r.awayScore : r.awayScore > r.homeScore;
      return (selection === "Favourite") === favWon ? "won" : "lost";
    }
    case "set_winner": {
      const firstSet = r.sets?.[0];
      if (!firstSet) return "void";
      const homeWonFirst = firstSet.home > firstSet.away;
      const favWonFirst = event.isHomeFavourite ? homeWonFirst : !homeWonFirst;
      return (selection === "Favourite") === favWonFirst ? "won" : "lost";
    }
    case "game_handicap": {
      if (!r.sets) return "void";
      const gamesHome = r.sets.reduce((s, x) => s + x.home, 0);
      const gamesAway = r.sets.reduce((s, x) => s + x.away, 0);
      const l = line ?? 0;
      const isFav = selection === "Favourite";
      const favGames = event.isHomeFavourite ? gamesHome : gamesAway;
      const dogGames = event.isHomeFavourite ? gamesAway : gamesHome;
      const adj = isFav ? favGames - dogGames + l : dogGames - favGames + l;
      if (adj > 0) return "won";
      if (adj < 0) return "lost";
      return "void";
    }
    case "set_handicap": {
      const favSets = event.isHomeFavourite ? r.homeScore : r.awayScore;
      const dogSets = event.isHomeFavourite ? r.awayScore : r.homeScore;
      const l = line ?? 0;
      const isFav = selection === "Favourite";
      const adj = isFav ? favSets - dogSets + l : dogSets - favSets + l;
      if (adj > 0) return "won";
      if (adj < 0) return "lost";
      return "void";
    }
    case "total_games": {
      const total = r.totalGames ?? 0;
      const l = line ?? 0;
      if (total === l) return "void";
      const over = total > l;
      return (selection === "Over") === over ? "won" : "lost";
    }
    default:
      return "void";
  }
}
