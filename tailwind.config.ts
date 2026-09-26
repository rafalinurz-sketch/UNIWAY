import type { Config } from "tailwindcss";

// Deep Space Theme — токены дизайн-системы Uniway
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          void: "#05050A",      // самый глубокий фон (body)
          deep: "#0B0C10",      // фон панелей/секций
          surface: "#12131A",   // приподнятые поверхности
          border: "rgba(255,255,255,0.08)",
        },
        accent: {
          violet: "#A855F7",
          cyan: "#06B6D4",
          pink: "#EC4899",
        },
      },
      fontFamily: {
        // Display — для заголовков и hero-цифр, Text — для основного текста
        display: ["var(--font-display)", "sans-serif"],
        text: ["var(--font-text)", "sans-serif"],
      },
      boxShadow: {
        "glow-violet": "0 0 24px rgba(168,85,247,0.45), 0 0 2px rgba(168,85,247,0.8)",
        "glow-cyan": "0 0 24px rgba(6,182,212,0.45), 0 0 2px rgba(6,182,212,0.8)",
        "glow-pink": "0 0 24px rgba(236,72,153,0.45), 0 0 2px rgba(236,72,153,0.8)",
        glass: "0 8px 32px rgba(0,0,0,0.55)",
      },
      backgroundImage: {
        "nebula-gradient":
          "radial-gradient(ellipse at top left, rgba(168,85,247,0.18), transparent 55%), radial-gradient(ellipse at bottom right, rgba(6,182,212,0.14), transparent 55%)",
        "aurora-border":
          "linear-gradient(135deg, rgba(168,85,247,0.6), rgba(6,182,212,0.4), rgba(236,72,153,0.6))",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 12px rgba(168,85,247,0.35)" },
          "50%": { boxShadow: "0 0 28px rgba(168,85,247,0.65)" },
        },
      },
      animation: {
        twinkle: "twinkle 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
