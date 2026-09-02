export const colors = {
  canvas: "#F1F2F6",
  surface: "#FFFFFF",
  surfaceRaised: "#FFFFFF",
  surfaceInset: "#F0F1F5",
  border: "#E7E9EF",
  borderStrong: "#D7DAE3",
  textPrimary: "#15171C",
  textSecondary: "#6B7280",
  textTertiary: "#9AA0AC",
  profit: "#1EA35A",
  loss: "#E1433F",
  edge: "#1C4ED8",
  headerBlue: "#1B37B0",
  live: "#E1433F",
  warn: "#DB8B0B",
  sport: {
    football: "#1C4ED8",
    basketball: "#FF8A00",
    hockey: "#6C6FE0",
    tennis: "#1EA35A",
  },
} as const;

export const sportIcons: Record<string, string> = {
  football: "football",
  basketball: "basketball",
  hockey: "snow",
  tennis: "tennisball",
};

export function sportColor(sportId: string): string {
  return (colors.sport as Record<string, string>)[sportId] ?? colors.edge;
}

const AVATAR_PALETTE = ["#1C4ED8", "#FF8A00", "#1EA35A", "#6C6FE0", "#E1433F", "#DB8B0B", "#0E9CB0", "#9B5DE5"];

export function avatarColorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}
