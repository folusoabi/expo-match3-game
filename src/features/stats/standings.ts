import type { StandingsRow } from "@/types";
import { getCompetitionMatches } from "@/data/mock/eventGenerator";

/**
 * Table computed from matches strictly before `asOfDateExclusive` (if given),
 * so a match being analyzed never leaks its own or later results into the
 * standings shown for it — 3 points for a win, 1 for a draw, applied
 * uniformly across sports for a consistent widget.
 */
export function computeStandings(competitionId: string, asOfDateExclusive?: string): StandingsRow[] {
  const matches = getCompetitionMatches(competitionId).filter((m) => !asOfDateExclusive || m.date < asOfDateExclusive);
  const table = new Map<string, StandingsRow>();

  function ensure(id: string, name: string): StandingsRow {
    let row = table.get(id);
    if (!row) {
      row = { teamId: id, teamName: name, played: 0, wins: 0, draws: 0, losses: 0, diff: 0, points: 0 };
      table.set(id, row);
    }
    return row;
  }

  for (const m of matches) {
    const home = ensure(m.home.id, m.home.name);
    const away = ensure(m.away.id, m.away.name);
    const hs = m.result.homeScore;
    const as = m.result.awayScore;

    home.played++;
    away.played++;
    home.diff += hs - as;
    away.diff += as - hs;

    if (hs > as) {
      home.wins++;
      home.points += 3;
      away.losses++;
    } else if (hs < as) {
      away.wins++;
      away.points += 3;
      home.losses++;
    } else {
      home.draws++;
      away.draws++;
      home.points += 1;
      away.points += 1;
    }
  }

  return Array.from(table.values()).sort((a, b) => b.points - a.points || b.diff - a.diff);
}
