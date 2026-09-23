"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = (localStorage.getItem("uniway_theme") as "dark" | "light" | null) ?? "dark";
    setMode(saved);
    applyTheme(saved);
  }, []);

  function applyTheme(next: "dark" | "light") {
    if (next === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
  }

  function toggle(next: "dark" | "light") {
    setMode(next);
    localStorage.setItem("uniway_theme", next);
    applyTheme(next);
  }

  if (compact) {
    const next = mode === "dark" ? "light" : "dark";
    return <button onClick={() => toggle(next)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-sm" aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>{mode === "dark" ? "☀️" : "🌙"}</button>;
  }

  return (
    <div className="flex items-center gap-1 rounded-full bg-white/5 p-1">
      <button
        onClick={() => toggle("dark")}
        className={`h-8 w-8 rounded-full text-xs ${mode === "dark" ? "bg-accent text-white" : "text-ink-soft"}`}
        aria-label="Night mode"
      >
        🌙
      </button>
      <button
        onClick={() => toggle("light")}
        className={`h-8 w-8 rounded-full text-xs ${mode === "light" ? "bg-accent text-white" : "text-ink-soft"}`}
        aria-label="Day mode"
      >
        ☀️
      </button>
    </div>
  );
}
