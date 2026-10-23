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

  const Icon = ({ light }: { light: boolean }) => light ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20.2 15.2A8.6 8.6 0 0 1 8.8 3.8 8.7 8.7 0 1 0 20.2 15.2Z"/><path d="m16.5 5 .4 1.1L18 6.5l-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4.4-1.1Z"/></svg>
  );

  if (compact) {
    const next = mode === "dark" ? "light" : "dark";
    return <button onClick={() => toggle(next)} className="theme-toggle grid h-9 w-9 place-items-center rounded-xl border border-line text-ink-soft" aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}><Icon light={mode === "dark"}/></button>;
  }

  return (
    <div className="flex items-center gap-1 rounded-full bg-white/5 p-1">
      <button
        onClick={() => toggle("dark")}
        className={`theme-toggle grid h-8 w-8 place-items-center rounded-full ${mode === "dark" ? "bg-accent text-white" : "text-ink-soft"}`}
        aria-label="Night mode"
        aria-pressed={mode === "dark"}
      >
        <Icon light={false}/>
      </button>
      <button
        onClick={() => toggle("light")}
        className={`theme-toggle grid h-8 w-8 place-items-center rounded-full ${mode === "light" ? "bg-accent text-white" : "text-ink-soft"}`}
        aria-label="Day mode"
        aria-pressed={mode === "light"}
      >
        <Icon light/>
      </button>
    </div>
  );
}
