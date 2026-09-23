"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SatQuestion } from "@/lib/types";
import SatQuiz from "@/components/SatQuiz";

export default function SatPage() {
  const [questions, setQuestions] = useState<SatQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SatQuestion[] | null>(null);
  const [topic, setTopic] = useState("");
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("sat_questions")
      .select("*")
      .eq("needs_review", false)
      .not("correct_index", "is", null)
      .limit(500)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setQuestions((data as SatQuestion[]) ?? []);
      });
  }, [supabase]);

  const topics = useMemo(() => Array.from(new Set((questions ?? []).map((q) => q.topic))).sort(), [questions]);

  if (session) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-10">
        <SatQuiz questions={session} onExit={() => setSession(null)} />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <span className="text-sm font-bold text-accent-light">SAT Preparation</span>
      <h1 className="mt-2 text-2xl font-extrabold">Practice with your real materials.</h1>

      {error && <p className="card-flat mt-4 bg-red-500/10 text-sm text-red-400">Could not load questions: {error}</p>}

      {questions === null && !error && <p className="mt-6 text-ink-soft">Loading…</p>}

      {questions !== null && questions.length === 0 && (
        <div className="card mt-6 text-center">
          <p className="font-semibold">Your question bank is currently empty.</p>
          <p className="mt-2 text-sm text-ink-soft">
            Import your SAT materials via <code>/admin/import</code> (admin only) — nothing is shown here until real
            questions exist in the <code>sat_questions</code> table.
          </p>
        </div>
      )}

      {questions !== null && questions.length > 0 && (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Stat label="Questions available" value={questions.length} />
            <Stat label="Topics" value={topics.length} />
            <Stat label="Math questions" value={questions.filter((q) => q.section === "math").length} />
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="card">
              <h3 className="font-bold">Quick Practice</h3>
              <p className="mt-1 text-sm text-ink-soft">A mixed set of up to 10 questions.</p>
              <button className="btn-primary mt-3" onClick={() => setSession(shuffle(questions).slice(0, 10))}>
                Start Practice
              </button>
            </div>
            <div className="card">
              <h3 className="font-bold">Topic Practice</h3>
              <select className="mt-2" value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="">Choose a topic…</option>
                {topics.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <button
                className="btn-outline mt-3"
                disabled={!topic}
                onClick={() => setSession(questions.filter((q) => q.topic === topic))}
              >
                Practice this topic
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card-flat">
      <div className="text-xs font-bold text-ink-soft">{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
    </div>
  );
}
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}
