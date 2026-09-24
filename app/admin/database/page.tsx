"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const TABLES = [
  "sat_tests",
  "sat_questions",
  "ielts_reading_tests",
  "ielts_reading_passages",
  "ielts_reading_questions",
  "ielts_listening_tests",
  "ielts_listening_questions",
  "ielts_writing_tasks",
  "ielts_speaking_prompts",
  "import_jobs",
  "question_review_queue",
  "user_attempts",
  "ielts_writing_submissions",
  "application_tracker",
];

export default function AdminDatabasePage() {
  const [counts, setCounts] = useState<Record<string, number | string>>({});
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const next: Record<string, number | string> = {};
      for (const t of TABLES) {
        const { count, error } = await supabase.from(t).select("*", { count: "exact", head: true });
        next[t] = error ? `error: ${error.message}` : count ?? 0;
      }
      setCounts(next);
    })();
  }, [supabase]);

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-extrabold">Database</h1>
      <p className="mt-2 text-sm text-ink-soft">Real row counts, queried live with the publishable key (respecting RLS).</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {TABLES.map((t) => (
          <div key={t} className="card-flat flex items-center justify-between">
            <code className="text-sm">{t}</code>
            <span className="pill">{counts[t] ?? "…"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
