import type { League, Sport, SportId } from "@/types";

export const SPORTS: Sport[] = [
  { id: "football", name: "Football", icon: "football", color: "football" },
  { id: "basketball", name: "Basketball", icon: "basketball", color: "basketball" },
  { id: "hockey", name: "Hockey", icon: "snow", color: "hockey" },
  { id: "tennis", name: "Tennis", icon: "tennisball", color: "tennis" },
];

export const LEAGUES: League[] = [
  // Football
  { id: "fb-metro", sportId: "football", name: "Metropolitan League", country: "England", shortName: "MET" },
  { id: "fb-iberia", sportId: "football", name: "Iberian Liga", country: "Spain", shortName: "IBR" },
  { id: "fb-alpine", sportId: "football", name: "Alpine Serie", country: "Italy", shortName: "ALP" },
  // Basketball
  { id: "bb-national", sportId: "basketball", name: "National Hoops Association", country: "USA", shortName: "NHA" },
  { id: "bb-continental", sportId: "basketball", name: "Continental Basketball League", country: "Europe", shortName: "CBL" },
  // Hockey
  { id: "hk-national", sportId: "hockey", name: "National Ice League", country: "USA/Canada", shortName: "NIL" },
  { id: "hk-continental", sportId: "hockey", name: "Continental Hockey Circuit", country: "Europe", shortName: "CHC" },
  // Tennis
  { id: "tn-mens", sportId: "tennis", name: "Grand Circuit — Men's Tour", country: "World", shortName: "GCM" },
  { id: "tn-womens", sportId: "tennis", name: "Grand Circuit — Women's Tour", country: "World", shortName: "GCW" },
];

export const TEAM_NAMES: Record<string, string[]> = {
  "fb-metro": [
    "Northbridge United", "Ashford Town", "Greywater Athletic", "Kelmsley Rovers",
    "Fenwick City", "Redcliffe FC", "Larkspur Albion", "Draymoor United",
    "Sutton Vale", "Millbrook Wanderers", "Copperfield FC", "Harrow Dynamo",
  ],
  "fb-iberia": [
    "Real Solano", "Valdemar CF", "Atletico Bruma", "Costa Nera",
    "Deportivo Aznar", "Sevilla Roja", "Marejada FC", "Union Pinares",
  ],
  "fb-alpine": [
    "Juventina", "AC Marendola", "Lazzurri Roma", "Milano Nord",
    "Torino Vecchia", "Napoli Sud FC", "Bergamo Calcio", "Firenze United",
  ],
  "bb-national": [
    "Portland Timberwolves", "Brooklyn Voltage", "Chicago Ironhawks", "Austin Comets",
    "Denver Peaks", "Miami Riptide", "Phoenix Furnace", "Seattle Cascade",
  ],
  "bb-continental": [
    "Madrid Estrellas", "Milano Falcons", "Berlin Bears", "Athens Titans",
    "Belgrade Vipers", "Istanbul Sultans",
  ],
  "hk-national": [
    "Toronto Frost", "Montreal Rafales", "Minnesota Timberwolves HC", "Boston Anchors",
    "Calgary Summit", "Detroit Forge", "Vancouver Tide", "Chicago Blackstone",
  ],
  "hk-continental": [
    "Helsinki Polar", "Prague Talons", "Zurich Glaciers", "Moscow Steel",
    "Stockholm Vikings HC", "Bratislava Wolves",
  ],
};

export const PLAYER_NAMES: Record<string, string[]> = {
  "tn-mens": [
    "N. Kovalenko", "R. Dupont", "M. Ferreira", "J. Nakamura", "A. Petrov",
    "L. Schmidt", "D. Alvarez", "T. Okafor", "S. Bergström", "K. Novak",
    "F. Rossi", "W. Chen",
  ],
  "tn-womens": [
    "E. Marchetti", "V. Sokolova", "H. Lindqvist", "C. Moreau", "P. Yamamoto",
    "G. Costa", "B. Wilhelm", "R. Osei", "N. Kwiatkowski", "S. Ibarra",
    "A. Novak", "M. Delacroix",
  ],
};

export const BOOKMAKERS = ["PinPoint", "Meridian Bet", "OddsForge", "Northgate", "Havenline"];

export function leaguesForSport(sportId: SportId): League[] {
  return LEAGUES.filter((l) => l.sportId === sportId);
}
