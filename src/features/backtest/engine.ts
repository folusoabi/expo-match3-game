import type {
  BacktestResult,
  EquityPoint,
  SimulatedBet,
  SportEvent,
  StrategyConfig,
} from "@/types";
import { getLeagueEvents } from "@/data/mock/eventGenerator";
import { getMarket } from "@/data/mock/markets";
import { getOdds, settleBet } from "@/data/mock/oddsEngine";
import { LEAGUES } from "@/data/mock/reference";

function passesFilters(event: SportEvent, strategy: StrategyConfig): boolean {
  const { filters } = strategy;

  if (filters.homeAway !== "any") {
    const wantsHome = filters.homeAway === "home";
    const selectionIsHome = strategy.selection === "Home";
    const selectionIsAway = strategy.selection === "Away";
    if ((selectionIsHome || selectionIsAway) && (selectionIsHome !== wantsHome)) {
      return false;
    }
  }

  if (filters.favourite !== "any") {
    const wantsFav = filters.favourite === "favourite";
    if (strategy.selection === "Favourite" || strategy.selection === "Underdog") {
      const selIsFav = strategy.selection === "Favourite";
      if (selIsFav !== wantsFav) return false;
    } else if (strategy.selection === "Home" || strategy.selection === "Away") {
      const selIsHome = strategy.selection === "Home";
      const selIsFav = selIsHome === event.isHomeFavourite;
      if (selIsFav !== wantsFav) return false;
    }
  }

  if (filters.form !== "any") {
    const relevantTeam = strategy.selection === "Away" ? event.away : event.home;
    const wins = relevantTeam.form.filter((r) => r === "W").length;
    const isHot = wins >= 3;
    if (filters.form === "hot" && !isHot) return false;
    if (filters.form === "cold" && isHot) return false;
  }

  return true;
}

export function runBacktest(strategy: StrategyConfig): BacktestResult {
  const market = getMarket(strategy.marketId);
  const allLeagueEvents = getLeagueEvents(strategy.leagueId);

  const fromT = new Date(strategy.dateFrom).getTime();
  const toT = new Date(strategy.dateTo).getTime();

  const candidateEvents = allLeagueEvents
    .filter((e) => {
      const t = new Date(e.date).getTime();
      return t >= fromT && t <= toT;
    })
    .filter((e) => passesFilters(e, strategy))
    .sort((a, b) => a.date.localeCompare(b.date));

  const league = LEAGUES.find((l) => l.id === strategy.leagueId);

  let bankroll = strategy.startingBankroll;
  let peakBankroll = strategy.startingBankroll;
  let maxDrawdown = 0;
  let maxDrawdownAmount = 0;
  let totalStaked = 0;

  let winStreak = 0;
  let lossStreak = 0;
  let longestWinStreak = 0;
  let longestLossStreak = 0;

  const bets: SimulatedBet[] = [];
  const equityCurve: EquityPoint[] = [
    { index: 0, date: strategy.dateFrom, bankroll: strategy.startingBankroll },
  ];

  let bestBet: SimulatedBet | null = null;
  let worstBet: SimulatedBet | null = null;

  for (const event of candidateEvents) {
    if (bankroll <= 0) break;

    const odds = getOdds({
      event,
      marketId: strategy.marketId,
      selection: strategy.selection,
      line: strategy.line,
      bookmaker: strategy.bookmaker,
    });

    if (odds < strategy.filters.minOdds || odds > strategy.filters.maxOdds) continue;

    const stake =
      strategy.stakeType === "fixed"
        ? Math.min(strategy.stakeValue, bankroll)
        : Math.max(0, Math.round(bankroll * (strategy.stakeValue / 100) * 100) / 100);

    if (stake <= 0) continue;

    const result = settleBet({
      event,
      marketId: strategy.marketId,
      selection: strategy.selection,
      line: strategy.line,
    });

    let profit = 0;
    if (result === "won") profit = Math.round(stake * (odds - 1) * 100) / 100;
    else if (result === "lost") profit = -stake;
    else profit = 0;

    bankroll = Math.round((bankroll + profit) * 100) / 100;
    totalStaked += stake;

    if (result === "won") {
      winStreak++;
      lossStreak = 0;
      longestWinStreak = Math.max(longestWinStreak, winStreak);
    } else if (result === "lost") {
      lossStreak++;
      winStreak = 0;
      longestLossStreak = Math.max(longestLossStreak, lossStreak);
    }

    peakBankroll = Math.max(peakBankroll, bankroll);
    const drawdown = peakBankroll > 0 ? (peakBankroll - bankroll) / peakBankroll : 0;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      maxDrawdownAmount = peakBankroll - bankroll;
    }

    const bet: SimulatedBet = {
      id: `bet-${event.id}-${strategy.id}`,
      eventId: event.id,
      date: event.date,
      sportId: event.sportId,
      leagueName: league?.name ?? "",
      eventLabel: `${event.home.name} vs ${event.away.name}`,
      marketName: market?.name ?? strategy.marketId,
      selection: strategy.line !== undefined ? `${strategy.selection} ${strategy.line > 0 ? "+" : ""}${strategy.line}` : strategy.selection,
      odds,
      bookmaker: strategy.bookmaker,
      stake,
      result,
      profit,
      bankrollAfter: bankroll,
    };

    bets.push(bet);
    equityCurve.push({ index: equityCurve.length, date: event.date, bankroll });

    if (!bestBet || profit > bestBet.profit) bestBet = bet;
    if (!worstBet || profit < worstBet.profit) worstBet = bet;
  }

  const wins = bets.filter((b) => b.result === "won").length;
  const losses = bets.filter((b) => b.result === "lost").length;
  const voids = bets.filter((b) => b.result === "void").length;
  const decided = wins + losses;
  const winRate = decided > 0 ? wins / decided : 0;
  const averageOdds = bets.length > 0 ? bets.reduce((s, b) => s + b.odds, 0) / bets.length : 0;
  const profit = Math.round((bankroll - strategy.startingBankroll) * 100) / 100;
  const roi = totalStaked > 0 ? profit / totalStaked : 0;

  return {
    id: `result-${strategy.id}-${Date.now()}`,
    strategyId: strategy.id,
    generatedAt: new Date().toISOString(),
    totalBets: bets.length,
    wins,
    losses,
    voids,
    winRate,
    averageOdds,
    startingBankroll: strategy.startingBankroll,
    finalBankroll: bankroll,
    profit,
    roi,
    totalStaked: Math.round(totalStaked * 100) / 100,
    maxDrawdown,
    maxDrawdownAmount: Math.round(maxDrawdownAmount * 100) / 100,
    longestWinStreak,
    longestLossStreak,
    bestBet,
    worstBet,
    equityCurve,
    bets,
  };
}
