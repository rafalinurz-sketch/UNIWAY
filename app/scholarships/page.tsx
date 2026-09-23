"use client";

import { useMemo, useState } from "react";
import { SCHOLARSHIPS } from "@/lib/data/scholarships";

export default function ScholarshipsPage() {
  const [country, setCountry] = useState("");
  const gks = SCHOLARSHIPS.find((s) => s.gks)!;
  const others = SCHOLARSHIPS.filter((s) => !s.gks);
  const filtered = useMemo(() => others.filter((s) => !country || s.country === country), [country, others]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <span className="text-sm font-bold text-accent-light">Scholarships</span>
      <h1 className="mt-2 text-2xl font-extrabold">Funding your education.</h1>

      <div className="card mt-5 text-white" style={{ background: "var(--panel-bg)" }}>
        <span className="pill">Featured</span>
        <h2 className="mt-2 text-xl font-extrabold">{gks.name}</h2>
        <p className="mt-2 text-white/70">{gks.coverage}</p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <span><b>Eligibility:</b> {gks.elig}</span>
          <span><b>Deadline:</b> {gks.deadline}</span>
        </div>
      </div>

      <select className="mt-5 max-w-[220px]" value={country} onChange={(e) => setCountry(e.target.value)}>
        <option value="">All countries</option>
        {Array.from(new Set(others.map((s) => s.country))).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <div key={s.name} className="card-flat">
            <b className="text-sm">{s.name}</b>
            <p className="mt-1 text-xs text-ink-soft">{s.country} · {s.type}</p>
            <p className="mt-2 text-sm">{s.coverage}</p>
            <p className="mt-1 text-xs text-ink-soft">Eligibility: {s.elig}</p>
            <span className="pill mt-2 inline-block">{s.deadline}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
