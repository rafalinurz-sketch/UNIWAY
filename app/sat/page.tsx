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
  const [history, setHistory] = useState<{ id: string; score: number | null; completed_at: string | null }[]>([]);
  const [mistakes, setMistakes] = useState<{ question: SatQuestion; selected: string | null; date: string | null }[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let active = true;
    supabase
      .from("sat_questions")
      .select("*")
      .eq("needs_review", false)
      .not("correct_index", "is", null)
      .limit(500)
      .then(async ({ data, error }) => {
        if (!active) return;
        if (error) setError(error.message);
        else setQuestions((data as SatQuestion[]) ?? []);
        const { data: auth } = await supabase.auth.getUser();
        if (!active || !auth.user) return;
        setSignedIn(true);
        const { data: attempts } = await supabase.from("user_attempts").select("id,score,completed_at").eq("user_id", auth.user.id).eq("test_type", "sat").order("completed_at", { ascending: false }).limit(12);
        if (!active || !attempts?.length) return;
        setHistory(attempts);
        const { data: wrong } = await supabase.from("user_answers").select("question_id,selected_answer,created_at").eq("is_correct", false).eq("question_table", "sat_questions").in("attempt_id", attempts.map((attempt) => attempt.id)).order("created_at", { ascending: false }).limit(40);
        if (!active || !wrong?.length) return;
        const questionIds = Array.from(new Set(wrong.map((answer) => answer.question_id)));
        const { data: questionRows } = await supabase.from("sat_questions").select("*").in("id", questionIds);
        if (!active || !questionRows) return;
        const questionMap = new Map((questionRows as SatQuestion[]).map((question) => [question.id, question]));
        const seenQuestions = new Set<string>();
        setMistakes(wrong.flatMap((answer) => { const question = questionMap.get(answer.question_id); if (!question || seenQuestions.has(question.id)) return []; seenQuestions.add(question.id); return [{ question, selected: answer.selected_answer, date: answer.created_at }]; }));
      });
    return () => { active = false; };
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
      <div className="card relative mb-5 overflow-hidden border-accent/20 bg-gradient-to-br from-accent/[0.12] via-surface to-blue-500/[0.06]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-16 h-44 w-44 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <span aria-hidden="true" className="cosmic-orb hidden h-14 w-14 shrink-0 rounded-full sm:block" />
          <div>
            <span className="text-sm font-bold text-accent-light">SAT · PRACTICE STATION</span>
            <h1 className="mt-1 text-2xl font-extrabold">Build your score one question at a time.</h1>
            <p className="mt-2 text-sm text-ink-soft">Original UNIWAY practice set, with clear explanations after each answer.</p>
          </div>
        </div>
      </div>

      {error && <p className="card-flat mt-4 bg-red-500/10 text-sm text-red-400">Could not load questions: {error}</p>}

      {questions === null && !error && <p className="mt-6 text-ink-soft">Loading…</p>}

      {questions !== null && questions.length === 0 && (
        <div className="card mt-6 text-center">
          <p className="font-semibold">Your question bank is currently empty.</p>
          <p className="mt-2 text-sm text-ink-soft">
            Run Supabase migrations <code>0001–0005</code> to load the original UNIWAY set, or add your own reviewed materials via <code>/admin/import</code>.
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
          {signedIn && <div className="card mt-5">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-accent-light">Your learning history</p><h2 className="mt-1 text-lg font-extrabold">SAT statistics</h2></div><p className="text-sm text-ink-soft">{history.length} recent sessions</p></div>
            {history.length ? <>
              <div className="mt-5 flex h-28 items-end gap-2" role="img" aria-label={`Scores from ${history.length} recent SAT practice sessions`}>
                {[...history].reverse().map((item, i) => <div key={item.id} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2" title={`${item.score ?? 0}% · ${item.completed_at ? new Date(item.completed_at).toLocaleDateString() : "Practice"}`}><span className="text-[10px] text-ink-soft opacity-0 transition group-hover:opacity-100">{item.score ?? 0}%</span><div className="w-full max-w-10 rounded-t-md bg-gradient-to-t from-accent to-blue-400 transition-all duration-500" style={{ height: `${Math.max(8, item.score ?? 0)}%` }}/><span className="text-[10px] text-ink-soft">{i + 1}</span></div>)}
              </div>
              <p className="mt-3 text-xs text-ink-soft">Practice accuracy by session, oldest to newest. This is not an official SAT score.</p>
            </> : <p className="mt-3 text-sm text-ink-soft">Complete a practice set to start building your statistics.</p>}
          </div>}
          {signedIn && <section className="card mt-5" aria-labelledby="saved-mistakes-heading">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-accent-light">Practice again with focus</p><h2 id="saved-mistakes-heading" className="mt-1 text-lg font-extrabold">Mistake review</h2></div>{mistakes.length > 0 && <button type="button" className="btn-outline px-4 py-2 text-sm" onClick={() => setSession(mistakes.map((item) => item.question))}>Practice mistakes · {mistakes.length}</button>}</div>
            {mistakes.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{mistakes.slice(0, 6).map((item, index) => { const selectedIndex = Number(item.selected); return <article key={`${item.question.id}-${index}`} className="rounded-xl border border-line bg-white/[.025] p-4"><p className="text-xs font-semibold text-ink-soft">{item.question.topic}{item.date ? ` · ${new Date(item.date).toLocaleDateString()}` : ""}</p><p className="mt-2 line-clamp-3 text-sm font-semibold">{item.question.question}</p><p className="mt-2 text-xs text-red-300">Previous answer: {Number.isInteger(selectedIndex) ? item.question.choices[selectedIndex] : item.selected ?? "—"}</p><p className="mt-1 text-xs text-emerald-300">Correct: {item.question.choices[item.question.correct_index ?? 0]}</p>{item.question.explanation && <p className="mt-2 line-clamp-3 text-xs leading-5 text-ink-soft">{item.question.explanation}</p>}</article>; })}</div> : <p className="mt-3 text-sm text-ink-soft">{history.length ? "No missed questions in your recent sessions. Great progress." : "Your missed answers will appear here after you complete a practice set."}</p>}
          </section>}
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
