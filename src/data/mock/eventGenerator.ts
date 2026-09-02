import type { Competitor, MatchResult, SportEvent, SportId } from "@/types";
import { seededRng, randInt, weightedBool } from "@/utils/seededRandom";
import { LEAGUES, TEAM_NAMES, PLAYER_NAMES } from "./reference";

const DATASET_FROM = "2024-01-01";
const DATASET_TO = "2026-08-24";

function strengthOf(name: string): number {
  // Deterministic 0.30–0.85 "quality" rating derived from the name itself.
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

function datesBetween(from: string, to: string, stepDays: number): string[] {
  const out: string[] = [];
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  for (let t = start; t <= end; t += stepDays * 86400000) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
}

function buildTeamRoster(leagueId: string): Competitor[] {
  const names = TEAM_NAMES[leagueId] ?? [];
  return names.map((name) => ({
    id: `${leagueId}-${name.replace(/\s+/g, "_")}`,
    name,
    shortName: name.split(" ").slice(-1)[0],
    form: [],
  }));
}

function buildPlayerRoster(leagueId: string): Competitor[] {
  const names = PLAYER_NAMES[leagueId] ?? [];
  return names.map((name) => ({
    id: `${leagueId}-${name.replace(/[\s.]+/g, "_")}`,
    name,
    shortName: name,
    form: [],
  }));
}

function generateFootballOrBallResult(
  sportId: SportId,
  homeStrength: number,
  awayStrength: number,
  rng: () => number
): MatchResult {
  if (sportId === "football") {
    const homeLambda = 1.1 + homeStrength * 1.6 + 0.25; // home advantage
    const awayLambda = 1.0 + awayStrength * 1.5;
    return { homeScore: poissonSample(rng, homeLambda), awayScore: poissonSample(rng, awayLambda) };
  }
  if (sportId === "basketball") {
    const base = 96;
    const homeScore = base + Math.round(homeStrength * 26) + randInt(rng, -8, 8) + 4;
    const awayScore = base + Math.round(awayStrength * 26) + randInt(rng, -8, 8);
    return { homeScore, awayScore };
  }
  // hockey
  const homeLambda = 2.3 + homeStrength * 1.4 + 0.15;
  const awayLambda = 2.1 + awayStrength * 1.3;
  return { homeScore: poissonSample(rng, homeLambda), awayScore: poissonSample(rng, awayLambda) };
}

function generateTennisResult(strengthA: number, strengthB: number, rng: () => number): MatchResult {
  const pA = 0.5 + (strengthA - strengthB) * 0.6;
  const sets: { home: number; away: number }[] = [];
  let setsA = 0;
  let setsB = 0;
  const target = 2; // best of 3
  while (setsA < target && setsB < target) {
    const aWinsSet = weightedBool(rng, Math.min(0.92, Math.max(0.08, pA)));
    let gamesWinner = randInt(rng, 6, 7);
    let gamesLoser = gamesWinner === 7 ? 6 : randInt(rng, 0, 4);
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

let cache: Map<string, SportEvent[]> | null = null;

function buildAll(): Map<string, SportEvent[]> {
  const map = new Map<string, SportEvent[]>();

  for (const league of LEAGUES) {
    const isTennis = league.sportId === "tennis";
    const roster = isTennis ? buildPlayerRoster(league.id) : buildTeamRoster(league.id);
    if (roster.length < 2) continue;

    const strengths: Record<string, number> = {};
    for (const c of roster) strengths[c.id] = strengthOf(c.id);

    const formLog: Record<string, ("W" | "L" | "D")[]> = {};
    const stepDays = isTennis ? 7 : 7;
    const rounds = datesBetween(DATASET_FROM, DATASET_TO, stepDays);
    const events: SportEvent[] = [];

    rounds.forEach((date, roundIdx) => {
      const n = roster.length;
      const matchesThisRound = isTennis ? Math.min(4, Math.floor(n / 2)) : Math.floor(n / 2);
      // Rotate roster order deterministically per round to vary pairings (like a round-robin schedule).
      const rotated = roster.slice(roundIdx % n).concat(roster.slice(0, roundIdx % n));

      for (let i = 0; i < matchesThisRound; i++) {
        const home = rotated[i * 2];
        const away = rotated[i * 2 + 1];
        if (!home || !away || home.id === away.id) continue;

        const eventId = `${league.id}-${date}-${home.id}-${away.id}`;
        const rng = seededRng(eventId);
        const hs = strengths[home.id];
        const as = strengths[away.id];

        const result = isTennis
          ? generateTennisResult(hs, as, rng)
          : generateFootballOrBallResult(league.sportId, hs, as, rng);

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

        events.push({
          id: eventId,
          sportId: league.sportId,
          leagueId: league.id,
          date,
          home: { ...home, form: homeForm },
          away: { ...away, form: awayForm },
          status: "completed",
          result,
          isHomeFavourite: hs + 0.05 >= as,
        });
      }
    });

    map.set(league.id, events);
  }

  return map;
}

function ensureCache(): Map<string, SportEvent[]> {
  if (!cache) cache = buildAll();
  return cache;
}

export function getLeagueEvents(leagueId: string): SportEvent[] {
  return ensureCache().get(leagueId) ?? [];
}

export function getAllEvents(): SportEvent[] {
  return Array.from(ensureCache().values()).flat();
}

export function getDatasetRange() {
  return { from: DATASET_FROM, to: DATASET_TO };
}

export function getEventById(id: string): SportEvent | undefined {
  return getAllEvents().find((e) => e.id === id);
}
