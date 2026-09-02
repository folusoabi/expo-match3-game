// ---------------------------------------------------------------------------
// Domain types. This is the contract the mock data layer implements today
// and that a real sports/odds API would implement later — UI code should
// only ever depend on these shapes, never on how the data was produced.
// ---------------------------------------------------------------------------

export type SportId = "football" | "basketball" | "hockey" | "tennis";

export interface Sport {
  id: SportId;
  name: string;
  icon: string; // Ionicons name
  color: string; // tailwind token key, e.g. "football"
}

export interface League {
  id: string;
  sportId: SportId;
  name: string;
  country: string;
  shortName: string;
}

export interface Competitor {
  id: string;
  name: string;
  shortName: string;
  form: ("W" | "L" | "D")[]; // last 5 results, most recent last
}

export type EventStatus = "completed";

export interface SportEvent {
  id: string;
  sportId: SportId;
  leagueId: string;
  date: string; // ISO date
  home: Competitor;
  away: Competitor;
  status: EventStatus;
  result: MatchResult;
  isHomeFavourite: boolean;
}

/** Final result data needed to settle any supported market. */
export interface MatchResult {
  homeScore: number;
  awayScore: number;
  /** Per-set scores, tennis only. */
  sets?: { home: number; away: number }[];
  totalGames?: number; // tennis
}

export type MarketId =
  | "match_result" // 1X2
  | "over_under"
  | "btts"
  | "asian_handicap"
  | "draw_no_bet"
  | "moneyline"
  | "spread"
  | "team_total"
  | "match_winner"
  | "set_winner"
  | "game_handicap"
  | "set_handicap"
  | "total_games";

export interface Market {
  id: MarketId;
  name: string;
  sportIds: SportId[];
  /** Selections available for this market, may depend on a line (e.g. O/U 2.5). */
  selections: string[];
  hasLine: boolean; // whether a numeric line (handicap/total) is required
  defaultLines?: number[];
}

export interface OddsQuote {
  bookmaker: string;
  price: number; // decimal odds
}

export type StakeType = "fixed" | "percentage";

export type FavouriteFilter = "any" | "favourite" | "underdog";
export type HomeAwayFilter = "any" | "home" | "away";
export type FormFilter = "any" | "hot" | "cold"; // hot = 3+ wins in last 5

export interface StrategyFilters {
  favourite: FavouriteFilter;
  homeAway: HomeAwayFilter;
  form: FormFilter;
  minOdds: number;
  maxOdds: number;
}

/** A user-configured backtest / strategy definition. */
export interface StrategyConfig {
  id: string;
  name: string;
  sportId: SportId;
  leagueId: string;
  marketId: MarketId;
  selection: string;
  line?: number;
  bookmaker: string;
  dateFrom: string; // ISO date
  dateTo: string; // ISO date
  startingBankroll: number;
  stakeType: StakeType;
  stakeValue: number; // fixed currency amount, or % of bankroll
  filters: StrategyFilters;
  createdAt: string;
}

export type BetResult = "won" | "lost" | "void";

export interface SimulatedBet {
  id: string;
  eventId: string;
  date: string;
  sportId: SportId;
  leagueName: string;
  eventLabel: string; // "Arsenal vs Chelsea"
  marketName: string;
  selection: string;
  odds: number;
  bookmaker: string;
  stake: number;
  result: BetResult;
  profit: number; // signed
  bankrollAfter: number;
}

export interface EquityPoint {
  index: number;
  date: string;
  bankroll: number;
}

export interface BacktestResult {
  id: string;
  strategyId: string;
  generatedAt: string;
  totalBets: number;
  wins: number;
  losses: number;
  voids: number;
  winRate: number; // 0-1
  averageOdds: number;
  startingBankroll: number;
  finalBankroll: number;
  profit: number;
  roi: number; // 0-1, relative to total staked
  totalStaked: number;
  maxDrawdown: number; // 0-1
  maxDrawdownAmount: number;
  longestWinStreak: number;
  longestLossStreak: number;
  bestBet: SimulatedBet | null;
  worstBet: SimulatedBet | null;
  equityCurve: EquityPoint[];
  bets: SimulatedBet[];
}

/** A saved strategy paired with the most recent backtest run against it. */
export interface SavedStrategy {
  config: StrategyConfig;
  lastResult: BacktestResult | null;
}
