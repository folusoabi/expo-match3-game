import type { Competition, Sport, SportId } from "@/types";

export const SPORTS: Sport[] = [
  { id: "football", name: "Football", icon: "football" },
  { id: "basketball", name: "Basketball", icon: "basketball" },
  { id: "hockey", name: "Hockey", icon: "snow" },
  { id: "tennis", name: "Tennis", icon: "tennisball" },
];

// Real, well-known league/club names are used as flavor text for this local
// dummy dataset (no logos, no live data, no claim of official affiliation).
// Individual tennis players use fictional names — see PLAYER_NAMES below —
// since attaching years of fabricated match outcomes to real athletes isn't
// something we do even in a demo.
export const COMPETITIONS: Competition[] = [
  { id: "epl", sportId: "football", name: "Premier League", country: "England", tier: 1 },
  { id: "champ", sportId: "football", name: "Championship", country: "England", tier: 2 },
  { id: "l1", sportId: "football", name: "League One", country: "England", tier: 3 },
  { id: "laliga", sportId: "football", name: "La Liga", country: "Spain", tier: 1 },
  { id: "laliga2", sportId: "football", name: "LaLiga 2", country: "Spain", tier: 2 },
  { id: "bundesliga", sportId: "football", name: "Bundesliga", country: "Germany", tier: 1 },

  { id: "nba", sportId: "basketball", name: "NBA", country: "USA", tier: 1 },
  { id: "euroleague", sportId: "basketball", name: "EuroLeague", country: "Europe", tier: 1 },

  { id: "nhl", sportId: "hockey", name: "NHL", country: "USA / Canada", tier: 1 },
  { id: "khl", sportId: "hockey", name: "KHL", country: "Europe", tier: 1 },

  { id: "atp", sportId: "tennis", name: "ATP Tour", country: "World", tier: 1 },
  { id: "wta", sportId: "tennis", name: "WTA Tour", country: "World", tier: 1 },
];

export const TEAM_NAMES: Record<string, string[]> = {
  epl: [
    "Arsenal", "Chelsea", "Liverpool", "Manchester City", "Manchester United", "Tottenham Hotspur",
    "Newcastle United", "Aston Villa", "West Ham United", "Brighton & Hove Albion", "Everton", "Fulham",
  ],
  champ: [
    "Leicester City", "Leeds United", "Southampton", "West Bromwich Albion", "Norwich City", "Middlesbrough",
    "Sunderland", "Coventry City", "Hull City", "Watford",
  ],
  l1: [
    "Portsmouth", "Bolton Wanderers", "Derby County", "Peterborough United", "Barnsley", "Charlton Athletic",
    "Wigan Athletic", "Blackpool",
  ],
  laliga: [
    "Real Madrid", "Barcelona", "Atletico Madrid", "Sevilla", "Real Sociedad", "Real Betis",
    "Villarreal", "Athletic Bilbao", "Valencia", "Girona",
  ],
  laliga2: [
    "Levante", "Racing Santander", "Eibar", "Sporting Gijon", "Elche", "Albacete",
  ],
  bundesliga: [
    "Bayern Munich", "Borussia Dortmund", "RB Leipzig", "Bayer Leverkusen", "Eintracht Frankfurt",
    "Wolfsburg", "Borussia Monchengladbach", "Freiburg",
  ],
  nba: [
    "Los Angeles Lakers", "Boston Celtics", "Golden State Warriors", "Miami Heat", "Milwaukee Bucks",
    "Denver Nuggets", "Phoenix Suns", "Dallas Mavericks", "Brooklyn Nets", "Philadelphia 76ers",
  ],
  euroleague: [
    "Real Madrid Baloncesto", "FC Barcelona Basquet", "Panathinaikos", "Olympiacos", "Fenerbahce", "Anadolu Efes",
  ],
  nhl: [
    "Toronto Maple Leafs", "Montreal Canadiens", "Boston Bruins", "New York Rangers", "Edmonton Oilers",
    "Colorado Avalanche", "Vegas Golden Knights", "Tampa Bay Lightning",
  ],
  khl: [
    "SKA Saint Petersburg", "CSKA Moscow", "Dynamo Moscow", "Ak Bars Kazan", "Metallurg Magnitogorsk", "Avangard Omsk",
  ],
};

export const PLAYER_NAMES: Record<string, string[]> = {
  atp: [
    "N. Kovalenko", "R. Dupont", "M. Ferreira", "J. Nakamura", "A. Petrov",
    "L. Schmidt", "D. Alvarez", "T. Okafor", "S. Bergstrom", "K. Novak",
    "F. Rossi", "W. Chen",
  ],
  wta: [
    "E. Marchetti", "V. Sokolova", "H. Lindqvist", "C. Moreau", "P. Yamamoto",
    "G. Costa", "B. Wilhelm", "R. Osei", "N. Kwiatkowski", "S. Ibarra",
    "A. Novak", "M. Delacroix",
  ],
};

export function competitionsForSport(sportId: SportId): Competition[] {
  return COMPETITIONS.filter((c) => c.sportId === sportId);
}

export function competitionsByCountry(sportId: SportId): { country: string; competitions: Competition[] }[] {
  const list = competitionsForSport(sportId);
  const map = new Map<string, Competition[]>();
  for (const c of list) {
    const arr = map.get(c.country) ?? [];
    arr.push(c);
    map.set(c.country, arr);
  }
  return Array.from(map.entries()).map(([country, competitions]) => ({ country, competitions }));
}
