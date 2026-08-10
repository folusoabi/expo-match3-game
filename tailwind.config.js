/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        // Body/default font (Google Font "Fredoka")
        sans: ["Fredoka-Regular"],
        fredoka: ["Fredoka-Regular"],
        "fredoka-medium": ["Fredoka-Medium"],
        "fredoka-semibold": ["Fredoka-SemiBold"],
        "fredoka-bold": ["Fredoka-Bold"],
        // Display font (custom free font, Kenney Future) for headlines
        display: ["KenneyFuture"],
        kenney: ["KenneyFuture"],
      },
    },
  },
  plugins: [],
};
