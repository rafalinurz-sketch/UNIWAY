"use client";

import { useMemo, useState } from "react";
import { OPPORTUNITIES } from "@/lib/data/opportunities";

export default function OpportunitiesPage() {
  const [category, setCategory] = useState("");
  const filtered = useMemo(() => OPPORTUNITIES.filter((o) => !category || o.category === category), [category]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <span className="text-sm font-bold text-accent-light">Opportunities</span>
      <h1 className="mt-2 text-2xl font-extrabold">Competitions, research &amp; volunteering.</h1>
      <p className="mt-2 text-xs text-ink-soft">
        Example directory — verify current deadlines and eligibility on each program&apos;s official site.
      </p>
      <select className="mt-4 max-w-[220px]" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All categories</option>
        {Array.from(new Set(OPPORTUNITIES.map((o) => o.category))).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {filtered.map((o) => (
          <div key={o.title} className="card-flat">
            <div className="flex justify-between gap-2">
              <b className="text-sm">{o.title}</b>
              <span className="pill">{o.category}</span>
            </div>
            <p className="mt-1 text-xs text-ink-soft">{o.country} · {o.online ? "Online" : "In-person"}</p>
            <p className="mt-2 text-sm text-ink-soft">Eligibility: {o.eligibility}</p>
            <span className="pill mt-2 inline-block">{o.deadline}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
