import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0052FF",
          indigo: "#4F46E5",
          purple: "#7C3AED",
        },
        ink: "#070A13",
        surface: "#0B0F19",
        teal: {
          primary: "#2e4f50",
          muted: "#2e4f50",
        },
        gold: {
          primary: "#d4a845",
          muted: "#f5d57a",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-nunito)",
          "Nunito",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      keyframes: {
        "glow-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(45px, -35px) scale(1.1)" },
          "50%": { transform: "translate(-25px, 25px) scale(0.94)" },
          "75%": { transform: "translate(30px, 35px) scale(1.06)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.15", transform: "scale(1)" },
          "50%": { opacity: "0.3", transform: "scale(1.12)" },
        },
      },
      animation: {
        "glow-drift-1": "glow-drift 16s ease-in-out infinite",
        "glow-drift-2": "glow-drift 13s ease-in-out infinite reverse",
        "glow-drift-3": "glow-drift 18s ease-in-out infinite",
        "glow-pulse": "glow-pulse 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;