/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        canvas: "#0A0E14",
        surface: "#12161F",
        surfaceRaised: "#171C27",
        surfaceInset: "#0D1119",
        border: "#232937",
        borderStrong: "#2E3646",
        text: {
          primary: "#E6E9EF",
          secondary: "#8B93A7",
          tertiary: "#5B6478",
        },
        profit: "#3DD9A4",
        loss: "#F0596B",
        edge: "#4C9FFF",
        warn: "#F5A623",
        football: "#4C9FFF",
        basketball: "#F5A623",
        hockey: "#7B8CFF",
        tennis: "#3DD9A4",
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        "sans-bold": ["Inter_700Bold"],
        mono: ["JetBrainsMono_400Regular"],
        "mono-medium": ["JetBrainsMono_500Medium"],
        "mono-bold": ["JetBrainsMono_700Bold"],
      },
      borderRadius: {
        card: "10px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};
