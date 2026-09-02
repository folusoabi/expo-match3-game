// ---------------------------------------------------------------------------
// Domain types for Rewind — a historical sports prediction simulator.
// The UI only ever depends on these shapes; the mock data layer implements
// them today, a real results/odds API would implement them later.
// ---------------------------------------------------------------------------

export type SportId = "football" | "basketball" | "hockey" | "tennis";

export interface Sport {
  id: SportId;
  name: string;
  icon: string; // Ionicons name
}

export interface Competition {
  id: string;
  sportId: SportId;
  name: string;
  country: string;
  tier: number; // 1 = top flight, used for grouping/ordering under a country
}

export interface Competitor {
  id: string;
  name: string;
  shortName: string;
  /** Results strictly before whatever match is currently being viewed, most recent last. */
  form: ("W" | "L" | "D")[];
}

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  sets?: { home: number; away: number }[]; // tennis
  totalGames?: number; // tennis
}

export interface Match {
  id: string;
  sportId: SportId;
  competitionId: string;
  date: string; // ISO date, always in the past relative to "today" in-app
  home: Competitor;
  away: Competitor;
  result: MatchResult;
  isHomeFavourite: boolean;
}

export type MarketId =
  | "match_result"
  | "over_under"
  | "btts"
  | "asian_handicap"
  | "draw_no_bet"
  | "moneyline"
  | "spread"
  | "puck_line"
  | "total_points"
  | "total_goals_hockey"
  | "team_total"
  | "match_winner"
  | "set_winner"
  | "game_handicap"
  | "set_handicap"
  | "total_games";

/** Internal, sport-agnostic selection keys. Display labels are derived per-match from team/player names. */
export type SelectionKey = "Home" | "Away" | "Draw" | "Over" | "Under" | "Yes" | "No";

export interface Market {
  id: MarketId;
  name: string;
  sportIds: SportId[];
  selections: SelectionKey[];
  hasLine: boolean;
  defaultLines?: number[];
}

export interface Selection {
  marketId: MarketId;
  key: SelectionKey;
  line?: number;
  label: string; // resolved display label, e.g. "Arsenal", "Over 2.5", "Draw"
  odds: number;
}

// ---------------------------------------------------------------------------
// Betting simulation
// ---------------------------------------------------------------------------

export interface BetSlipSelection {
  id: string; // unique within the slip
  matchId: string;
  sportId: SportId;
  eventLabel: string; // "Arsenal vs Chelsea"
  competitionName: string;
  marketId: MarketId;
  marketName: string;
  selectionKey: SelectionKey;
  line?: number;
  selectionLabel: string;
  odds: number;
}

export type BetStatus = "pending" | "won" | "lost";
export type BetKind = "single" | "accumulator";

export interface PlacedBet {
  id: string;
  kind: BetKind;
  placedAt: string; // real ISO timestamp of when the user placed it in-app
  selections: BetSlipSelection[];
  combinedOdds: number;
  stake: number;
  potentialReturn: number;
  status: BetStatus;
  settledAt?: string;
  profit?: number; // signed, only once settled
}

export interface BankrollTransaction {
  id: string;
  type: "stake" | "payout" | "reset";
  amount: number; // signed
  balanceAfter: number;
  betId?: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  startingBalance: number;
  balance: number;
  favouriteTeamIds: string[];
}

export interface StandingsRow {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  diff: number;
  points: number;
}

export interface H2HMeeting {
  match: Match;
  scoreLabel: string;
}
