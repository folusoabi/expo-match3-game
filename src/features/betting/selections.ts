import type { Match, Market, Selection, SelectionKey } from "@/types";
import { getOdds } from "@/data/mock/oddsEngine";
import { marketsForSport } from "@/data/mock/markets";

function labelFor(match: Match, key: SelectionKey, line?: number): string {
  switch (key) {
    case "Home":
      return match.home.name;
    case "Away":
      return match.away.name;
    case "Draw":
      return "Draw";
    case "Yes":
      return "Yes";
    case "No":
      return "No";
    case "Over":
      return line !== undefined ? `Over ${line}` : "Over";
    case "Under":
      return line !== undefined ? `Under ${line}` : "Under";
    default:
      return key;
  }
}

export function buildSelection(match: Match, market: Market, key: SelectionKey, line?: number): Selection {
  const odds = getOdds({ match, marketId: market.id, selection: key, line });
  const label = labelFor(match, key, line);
  return { marketId: market.id, key, line, label, odds };
}

export interface MarketSection {
  market: Market;
  line?: number;
  selections: Selection[];
}

/** One section per applicable market for this match's sport, using a sensible middle default line where a line is required. */
export function buildOddsBoard(match: Match): MarketSection[] {
  const markets = marketsForSport(match.sportId);
  return markets.map((market) => {
    if (!market.hasLine) {
      return { market, selections: market.selections.map((s) => buildSelection(match, market, s)) };
    }
    const lines = market.defaultLines ?? [0];
    const line = lines[Math.floor(lines.length / 2)];
    return { market, line, selections: market.selections.map((s) => buildSelection(match, market, s, line)) };
  });
}
