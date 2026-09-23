import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        "accent-light": "rgb(var(--accent-light-rgb) / <alpha-value>)",
        "accent-2": "rgb(var(--accent-2-rgb) / <alpha-value>)",
        ink: "var(--ink)",
        "ink-soft": "rgb(var(--ink-soft-rgb) / <alpha-value>)",
        line: "var(--line)",
      },
      fontFamily: {
        display: ["Manrope", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "26px",
        md: "18px",
        sm: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
