/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
theme: {
    extend: {
      colors: {
        // Light, Sofascore-style palette — white cards on a soft grey canvas,
        // with a deep blue used for header chrome and primary actions.
        canvas: "#F1F2F6",
        surface: "#FFFFFF",
        surfaceRaised: "#FFFFFF",
        surfaceInset: "#F0F1F5",
        border: "#E7E9EF",
        borderStrong: "#D7DAE3",
        text: {
          primary: "#15171C",
          secondary: "#6B7280",
          tertiary: "#9AA0AC",
        },
        profit: "#1EA35A",
        loss: "#E1433F",
        edge: "#1C4ED8",
        headerBlue: "#1B37B0",
        live: "#E1433F",
        warn: "#DB8B0B",
        football: "#1C4ED8",
        basketball: "#FF8A00",
        hockey: "#6C6FE0",
        tennis: "#1EA35A",
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        "sans-bold": ["Inter_700Bold"],
        mono: ["Inter_500Medium"],
        "mono-medium": ["Inter_600SemiBold"],
        "mono-bold": ["Inter_700Bold"],
      },
      borderRadius: {
        card: "16px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};
