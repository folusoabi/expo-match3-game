import type { H2HMeeting } from "@/types";
import { getAllMatches } from "@/data/mock/eventGenerator";

/** Past meetings between two teams strictly before `asOfDateExclusive`, most recent first. */
export function getHeadToHead(teamAId: string, teamBId: string, asOfDateExclusive?: string): H2HMeeting[] {
  const all = getAllMatches();
  const meetings = all.filter(
    (m) =>
      (!asOfDateExclusive || m.date < asOfDateExclusive) &&
      ((m.home.id === teamAId && m.away.id === teamBId) || (m.home.id === teamBId && m.away.id === teamAId))
  );
  return meetings
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((match) => ({ match, scoreLabel: `${match.result.homeScore}-${match.result.awayScore}` }));
}

export interface H2HSummary {
  teamAWins: number;
  teamBWins: number;
  draws: number;
}

export function summarizeH2H(teamAId: string, meetings: H2HMeeting[]): H2HSummary {
  let teamAWins = 0;
  let teamBWins = 0;
  let draws = 0;
  for (const m of meetings) {
    const { home, result } = m.match;
    const homeIsA = home.id === teamAId;
    if (result.homeScore === result.awayScore) {
      draws++;
    } else if (result.homeScore > result.awayScore) {
      if (homeIsA) teamAWins++;
      else teamBWins++;
    } else {
      if (homeIsA) teamBWins++;
      else teamAWins++;
    }
  }
  return { teamAWins, teamBWins, draws };
}
