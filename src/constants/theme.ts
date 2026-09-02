export const colors = {
  canvas: "#0A0E14",
  surface: "#12161F",
  surfaceRaised: "#171C27",
  surfaceInset: "#0D1119",
  border: "#232937",
  borderStrong: "#2E3646",
  textPrimary: "#E6E9EF",
  textSecondary: "#8B93A7",
  textTertiary: "#5B6478",
  profit: "#3DD9A4",
  loss: "#F0596B",
  edge: "#4C9FFF",
  warn: "#F5A623",
  sport: {
    football: "#4C9FFF",
    basketball: "#F5A623",
    hockey: "#7B8CFF",
    tennis: "#3DD9A4",
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
