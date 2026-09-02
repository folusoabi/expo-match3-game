import type { Competitor, Match, MatchResult, SportId } from "@/types";
import { seededRng, randInt, weightedBool } from "@/utils/seededRandom";
import { COMPETITIONS, TEAM_NAMES, PLAYER_NAMES } from "./reference";

export const DATASET_FROM = "2020-01-01";
export const TODAY = "2026-08-31"; // "present day" the app treats as the edge of history
const ROUND_CADENCE_DAYS = 10;

function strengthOf(name: string): number {
  const rng = seededRng(`strength:${name}`);
  return 0.3 + rng() * 0.55;
}

function poissonSample(rng: () => number, lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > L && k < 12);
  return k - 1;
}

function pushForm(log: Record<string, ("W" | "L" | "D")[]>, id: string, r: "W" | "L" | "D") {
  const arr = log[id] ?? (log[id] = []);
  arr.push(r);
  if (arr.length > 5) arr.shift();
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function datesBetween(from: string, to: string, stepDays: number): string[] {
  const out: string[] = [];
  let cursor = from;
  while (cursor <= to) {
    out.push(cursor);
    cursor = addDays(cursor, stepDays);
  }
  return out;
}

function buildRoster(competitionId: string, sportId: SportId): Competitor[] {
  const names = sportId === "tennis" ? PLAYER_NAMES[competitionId] ?? [] : TEAM_NAMES[competitionId] ?? [];
  return names.map((name) => ({
    id: `${competitionId}-${name.replace(/[\s.&]+/g, "_")}`,
    name,
    shortName: sportId === "tennis" ? name : name.split(" ").slice(-1)[0],
    form: [],
  }));
}

function generateResult(sportId: SportId, homeStrength: number, awayStrength: number, rng: () => number): MatchResult {
  if (sportId === "football") {
    const homeLambda = 1.1 + homeStrength * 1.6 + 0.25;
    const awayLambda = 1.0 + awayStrength * 1.5;
    return { homeScore: poissonSample(rng, homeLambda), awayScore: poissonSample(rng, awayLambda) };
  }
  if (sportId === "basketball") {
    const base = 96;
    const homeScore = base + Math.round(homeStrength * 26) + randInt(rng, -8, 8) + 4;
    const awayScore = base + Math.round(awayStrength * 26) + randInt(rng, -8, 8);
    return { homeScore, awayScore };
  }
  if (sportId === "hockey") {
    const homeLambda = 2.3 + homeStrength * 1.4 + 0.15;
    const awayLambda = 2.1 + awayStrength * 1.3;
    return { homeScore: poissonSample(rng, homeLambda), awayScore: poissonSample(rng, awayLambda) };
  }
  // tennis
  const pA = 0.5 + (homeStrength - awayStrength) * 0.6;
  const sets: { home: number; away: number }[] = [];
  let setsA = 0;
  let setsB = 0;
  while (setsA < 2 && setsB < 2) {
    const aWinsSet = weightedBool(rng, Math.min(0.92, Math.max(0.08, pA)));
    const gamesWinner = randInt(rng, 6, 7);
    const gamesLoser = gamesWinner === 7 ? 6 : randInt(rng, 0, 4);
    if (aWinsSet) {
      sets.push({ home: gamesWinner, away: gamesLoser });
      setsA++;
    } else {
      sets.push({ home: gamesLoser, away: gamesWinner });
      setsB++;
    }
  }
  const totalGames = sets.reduce((s, x) => s + x.home + x.away, 0);
  return { homeScore: setsA, awayScore: setsB, sets, totalGames };
}

let cache: Map<string, Match[]> | null = null;
let dateIndex: Map<string, Match[]> | null = null;

function ensureDateIndex(): Map<string, Match[]> {
  if (dateIndex) return dateIndex;
  dateIndex = new Map();
  for (const m of getAllMatches()) {
    const arr = dateIndex.get(m.date) ?? [];
    arr.push(m);
    dateIndex.set(m.date, arr);
  }
  return dateIndex;
}

function buildAll(): Map<string, Match[]> {
  const map = new Map<string, Match[]>();

  COMPETITIONS.forEach((competition, competitionIndex) => {
    const roster = buildRoster(competition.id, competition.sportId);
    if (roster.length < 2) return;

    const strengths: Record<string, number> = {};
    for (const c of roster) strengths[c.id] = strengthOf(c.id);

    const formLog: Record<string, ("W" | "L" | "D")[]> = {};
    const start = addDays(DATASET_FROM, competitionIndex % ROUND_CADENCE_DAYS);
    const rounds = datesBetween(start, TODAY, ROUND_CADENCE_DAYS);
    const matches: Match[] = [];

    rounds.forEach((date, roundIdx) => {
      const n = roster.length;
      const matchesThisRound = Math.floor(n / 2);
      const rotated = roster.slice(roundIdx % n).concat(roster.slice(0, roundIdx % n));

      for (let i = 0; i < matchesThisRound; i++) {
        const home = rotated[i * 2];
        const away = rotated[i * 2 + 1];
        if (!home || !away || home.id === away.id) continue;

        const matchId = `${competition.id}-${date}-${home.id}-${away.id}`;
        const rng = seededRng(matchId);
        const hs = strengths[home.id];
        const as = strengths[away.id];
        const result = generateResult(competition.sportId, hs, as, rng);

        const homeForm = (formLog[home.id] ?? []).slice();
        const awayForm = (formLog[away.id] ?? []).slice();

        let homeOutcome: "W" | "L" | "D";
        let awayOutcome: "W" | "L" | "D";
        if (result.homeScore > result.awayScore) {
          homeOutcome = "W";
          awayOutcome = "L";
        } else if (result.homeScore < result.awayScore) {
          homeOutcome = "L";
          awayOutcome = "W";
        } else {
          homeOutcome = "D";
          awayOutcome = "D";
        }
        pushForm(formLog, home.id, homeOutcome);
        pushForm(formLog, away.id, awayOutcome);

        matches.push({
          id: matchId,
          sportId: competition.sportId,
          competitionId: competition.id,
          date,
          home: { ...home, form: homeForm },
          away: { ...away, form: awayForm },
          result,
          isHomeFavourite: hs + 0.05 >= as,
        });
      }
    });

    map.set(competition.id, matches);
  });

  return map;
}

function ensureCache(): Map<string, Match[]> {
  if (!cache) cache = buildAll();
  return cache;
}

export function getCompetitionMatches(competitionId: string): Match[] {
  return ensureCache().get(competitionId) ?? [];
}

export function getAllMatches(): Match[] {
  return Array.from(ensureCache().values()).flat();
}

export function getMatchById(id: string): Match | undefined {
  for (const [cid, matches] of ensureCache()) {
    if (id.startsWith(`${cid}-`)) {
      const found = matches.find((m) => m.id === id);
      if (found) return found;
    }
  }
  return undefined;
}

export function getMatchesForDate(date: string, sportId?: SportId): Match[] {
  const matches = ensureDateIndex().get(date) ?? [];
  return sportId ? matches.filter((m) => m.sportId === sportId) : matches;
}

export function getMatchesForCompetitionAndDate(competitionId: string, date: string): Match[] {
  return getCompetitionMatches(competitionId).filter((m) => m.date === date);
}

/** Dates within a given year+month (1-12) that have at least one match for a competition. */
export function getMatchDatesInMonth(competitionId: string, year: number, month: number): string[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const set = new Set<string>();
  for (const m of getCompetitionMatches(competitionId)) {
    if (m.date.startsWith(prefix)) set.add(m.date);
  }
  return Array.from(set).sort();
}

export function getDatasetRange() {
  return { from: DATASET_FROM, to: TODAY };
}

export function getDatesWithMatchesInRange(from: string, to: string, sportId?: SportId): Set<string> {
  const set = new Set<string>();
  const idx = ensureDateIndex();
  for (const [date, matches] of idx) {
    if (date < from || date > to) continue;
    if (!sportId || matches.some((m) => m.sportId === sportId)) set.add(date);
  }
  return set;
}

export interface TeamRef {
  id: string;
  name: string;
  shortName: string;
  competitionId: string;
  sportId: SportId;
}

let teamIndex: Map<string, TeamRef> | null = null;

function ensureTeamIndex(): Map<string, TeamRef> {
  if (teamIndex) return teamIndex;
  teamIndex = new Map();
  for (const m of getAllMatches()) {
    if (!teamIndex.has(m.home.id)) {
      teamIndex.set(m.home.id, { id: m.home.id, name: m.home.name, shortName: m.home.shortName, competitionId: m.competitionId, sportId: m.sportId });
    }
    if (!teamIndex.has(m.away.id)) {
      teamIndex.set(m.away.id, { id: m.away.id, name: m.away.name, shortName: m.away.shortName, competitionId: m.competitionId, sportId: m.sportId });
    }
  }
  return teamIndex;
}

export function findTeamById(teamId: string): TeamRef | undefined {
  return ensureTeamIndex().get(teamId);
}

export function searchTeams(query: string): TeamRef[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return Array.from(ensureTeamIndex().values()).filter((t) => t.name.toLowerCase().includes(q));
}

export function getTeamMatches(teamId: string): Match[] {
  return getAllMatches()
    .filter((m) => m.home.id === teamId || m.away.id === teamId)
    .sort((a, b) => b.date.localeCompare(a.date));
}
