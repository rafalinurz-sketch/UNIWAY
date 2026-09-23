"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SatQuestion } from "@/lib/types";

export default function AdminReviewPage() {
  const [rows, setRows] = useState<SatQuestion[] | null>(null);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from("sat_questions").select("*").eq("needs_review", true).limit(200);
    setRows((data as SatQuestion[]) ?? []);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirm(id: string, correctIndex: number | null) {
    const patch: Record<string, unknown> = { needs_review: false };
    if (correctIndex !== null) patch.correct_index = correctIndex;
    await supabase.from("sat_questions").update(patch).eq("id", id);
    load();
  }
  async function remove(id: string) {
    if (!confirm) return;
    await supabase.from("sat_questions").delete().eq("id", id);
    load();
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Review Queue</h1>
        <button onClick={load} className="pill">Refresh</button>
      </div>
      <p className="mt-2 text-sm text-ink-soft">Questions flagged needs_review — usually because a confident correct answer wasn&apos;t found automatically.</p>

      {rows === null && <p className="mt-6 text-ink-soft">Loading…</p>}
      {rows !== null && rows.length === 0 && <p className="mt-6 text-ink-soft">Nothing needs review right now.</p>}

      <div className="mt-5 space-y-4">
        {(rows ?? []).map((q) => (
          <ReviewRow key={q.id} q={q} onConfirm={confirm} onDelete={remove} />
        ))}
      </div>
    </section>
  );
}

function ReviewRow({ q, onConfirm, onDelete }: { q: SatQuestion; onConfirm: (id: string, i: number | null) => void; onDelete: (id: string) => void }) {
  const [choice, setChoice] = useState<number | null>(q.correct_index);
  return (
    <div className="card-flat">
      <p className="text-sm font-semibold">{q.question}</p>
      <p className="mt-1 text-xs text-ink-soft">
        From: {q.source_file ?? "unknown"} · {q.topic}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select value={choice ?? ""} onChange={(e) => setChoice(e.target.value === "" ? null : parseInt(e.target.value))}>
          <option value="">Set correct answer…</option>
          {q.choices.map((c, i) => (
            <option key={i} value={i}>
              {String.fromCharCode(65 + i)}. {c}
            </option>
          ))}
        </select>
        <button onClick={() => onConfirm(q.id, choice)} className="pill">Mark reviewed</button>
        <button onClick={() => onDelete(q.id)} className="pill" style={{ color: "#f87171" }}>Delete</button>
      </div>
    </div>
  );
}
