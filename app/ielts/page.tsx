"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { IeltsPassage, IeltsReadingQuestion } from "@/lib/types";

type Tab = "reading" | "writing" | "speaking";
type WritingTask = { id: string; task_type: "task1" | "task2"; title: string | null; prompt: string };
type SpeakingPrompt = { id: string; part: "Part 1" | "Part 2" | "Part 3"; prompt: string };
type ReadingResult = { correct: number; total: number };

export default function IeltsPage() {
  const [tab, setTab] = useState<Tab>("reading");
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "reading", label: "Reading", icon: "▤" },
    { id: "writing", label: "Writing", icon: "✎" },
    { id: "speaking", label: "Speaking", icon: "◉" },
  ];

  return (
    <section className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="card relative mb-6 overflow-hidden border-accent/20 bg-gradient-to-br from-accent/[0.12] via-surface to-blue-500/[0.06]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-16 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <span aria-hidden="true" className="cosmic-orb hidden h-16 w-16 shrink-0 rounded-full sm:block" />
          <div>
            <span className="text-sm font-bold text-accent-light">IELTS · PRACTICE STATION</span>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Train every skill, one mission at a time.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">Original UNIWAY practice material. It is not an official IELTS test or band score.</p>
          </div>
        </div>
      </div>
      <div role="tablist" aria-label="IELTS practice sections" className="mb-5 grid grid-cols-3 gap-2 rounded-2xl border border-line bg-surface/80 p-1.5">
        {tabs.map((item) => (
          <button key={item.id} role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} className={`min-h-11 rounded-xl px-2 py-2 text-sm font-bold transition ${tab === item.id ? "bg-accent/20 text-accent-light shadow-sm" : "text-ink-soft hover:text-ink"}`}>
            <span aria-hidden="true" className="mr-2">{item.icon}</span>{item.label}
          </button>
        ))}
      </div>
      {tab === "reading" ? <ReadingTab /> : tab === "writing" ? <WritingTab /> : <SpeakingTab />}
    </section>
  );
}

function ReadingTab() {
  const supabase = useMemo(() => createClient(), []);
  const [passages, setPassages] = useState<IeltsPassage[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<IeltsPassage | null>(null);
  const [questions, setQuestions] = useState<IeltsReadingQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.from("ielts_reading_passages").select("*").eq("needs_review", false).order("title").then(({ data, error }) => {
      if (!active) return;
      if (error) setLoadError(error.message);
      else setPassages((data as IeltsPassage[]) ?? []);
    });
    return () => { active = false; };
  }, [supabase]);

  async function open(passage: IeltsPassage) {
    setOpening(true);
    setLoadError(null);
    setSelected(passage);
    setAnswers({});
    setQuestions([]);
    setResult(null);
    setStatus(null);
    const { data, error } = await supabase.from("ielts_reading_questions").select("*").eq("passage_id", passage.id).eq("needs_review", false);
    if (error) setLoadError(error.message);
    setQuestions((data as IeltsReadingQuestion[]) ?? []);
    setOpening(false);
  }

  async function submit() {
    if (!selected || questions.length === 0 || questions.some((q) => !(answers[q.id] ?? "").trim())) {
      setStatus("Answer every question before checking your work.");
      return;
    }
    setSubmitting(true);
    const correct = questions.filter((q) => isCorrectReadingAnswer(q, answers[q.id])).length;
    setResult({ correct, total: questions.length });
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setStatus("Your score is ready. Sign in to save it to your practice history.");
    } else {
      const { error } = await supabase.from("user_attempts").insert({
        user_id: auth.user.id,
        test_type: "ielts_reading",
        test_id: selected.id,
        score: Math.round((100 * correct) / questions.length),
        completed_at: new Date().toISOString(),
      });
      setStatus(error ? "Your score was checked but could not be saved. Please try again later." : "Result saved to your practice history.");
    }
    setSubmitting(false);
  }

  if (passages === null && !loadError) return <LoadingCard label="Loading reading missions…" />;
  if (loadError && !selected && passages === null) return <ErrorCard message={loadError} />;
  if (!selected && (passages?.length ?? 0) === 0) return <EmptyBank kind="IELTS Reading" />;

  if (!selected) return (
    <div className="grid gap-4 sm:grid-cols-2">
      {passages?.map((passage, index) => (
        <button key={passage.id} type="button" onClick={() => open(passage)} className="card group text-left transition hover:-translate-y-0.5">
          <div className="flex items-start justify-between gap-3"><span className="pill border border-accent/20 bg-accent/10 text-accent-light">READING · {String(index + 1).padStart(2, "0")}</span><span aria-hidden="true" className="text-accent-light transition group-hover:translate-x-1">↗</span></div>
          <h2 className="mt-4 text-lg font-extrabold">{passage.title}</h2>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-soft">{passage.text}</p>
          <span className="mt-4 inline-flex text-sm font-bold text-accent-light">Open passage →</span>
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <button type="button" onClick={() => { setSelected(null); setResult(null); setLoadError(null); }} className="mb-4 text-sm font-semibold text-ink-soft hover:text-ink">← All reading passages</button>
      {loadError && <ErrorCard message={loadError} />}
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="card">
          <span className="pill border border-accent/20 bg-accent/10 text-accent-light">READING PASSAGE</span>
          <h2 className="mt-3 text-xl font-extrabold">{selected.title}</h2>
          <div className="mt-4 max-h-[34rem] overflow-y-auto whitespace-pre-line pr-2 text-sm leading-7 text-ink-soft">{selected.text}</div>
        </article>
        <div className="card">
          <div className="flex items-center justify-between gap-2"><h2 className="text-lg font-extrabold">Mission questions</h2><span className="pill">{questions.length} items</span></div>
          {opening ? <p className="mt-4 text-sm text-ink-soft">Loading questions…</p> : questions.length === 0 ? <p className="mt-4 text-sm text-ink-soft">No reviewed questions are attached to this passage yet.</p> : (
            <div className="mt-4 space-y-3">
              {questions.map((question, index) => <ReadingQuestion key={question.id} question={question} number={index + 1} value={answers[question.id] ?? ""} onChange={(value) => { setAnswers((current) => ({ ...current, [question.id]: value })); setResult(null); setStatus(null); }} disabled={result !== null} />)}
            </div>
          )}
          {questions.length > 0 && <button type="button" onClick={submit} disabled={submitting || result !== null} className="btn-primary mt-5 w-full">{submitting ? "Checking…" : result ? "Answers checked" : "Check answers"}</button>}
          {result && <div role="status" className="mt-4 rounded-2xl border border-accent/20 bg-accent/[0.08] p-4"><p className="font-bold">You got {result.correct} of {result.total} correct.</p><p className="mt-1 text-xs text-ink-soft">Practice accuracy only; this is not an official IELTS band score.</p></div>}
          {status && <p role="status" className="mt-3 text-sm text-ink-soft">{status}</p>}
        </div>
      </div>
    </div>
  );
}

function ReadingQuestion({ question, number, value, onChange, disabled }: { question: IeltsReadingQuestion; number: number; value: string; onChange: (value: string) => void; disabled: boolean }) {
  const choices = question.choices ?? [];
  const isChoice = question.type.toLowerCase() === "mcq" || choices.length > 0;
  const isTrueFalse = ["tfng", "true_false_not_given"].includes(question.type.toLowerCase());
  return (
    <div className="card-flat">
      <label htmlFor={`reading-answer-${question.id}`} className="block text-sm font-semibold leading-6"><span className="mr-2 text-accent-light">{String(number).padStart(2, "0")}</span>{question.question.split(" Accept:")[0]}</label>
      {isChoice ? (
        <select id={`reading-answer-${question.id}`} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-3">
          <option value="">Choose an answer…</option>{choices.map((choice, index) => <option key={`${question.id}-${index}`} value={String(index)}>{String.fromCharCode(65 + index)}. {choice}</option>)}
        </select>
      ) : isTrueFalse ? (
        <select id={`reading-answer-${question.id}`} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-3">
          <option value="">Choose an answer…</option>{["True", "False", "Not Given"].map((option) => <option key={option}>{option}</option>)}
        </select>
      ) : (
        <input id={`reading-answer-${question.id}`} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-3" placeholder="Type your answer" />
      )}
    </div>
  );
}

function isCorrectReadingAnswer(question: IeltsReadingQuestion, value: string | undefined) {
  const normalize = (text: string) => text.trim().toLowerCase().replace(/[.,!?;:]+$/g, "").replace(/\s+/g, " ");
  if (question.type.toLowerCase() === "mcq" || (question.choices?.length ?? 0) > 0) {
    return normalize(value ?? "") === normalize(question.answer ?? "");
  }
  return (question.answer ?? "").split("|").some((answer) => normalize(answer) === normalize(value ?? ""));
}

function WritingTab() {
  const supabase = useMemo(() => createClient(), []);
  const [tasks, setTasks] = useState<WritingTask[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const selected = tasks?.find((task) => task.id === selectedId) ?? null;
  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data, error: taskError }, { data: auth }] = await Promise.all([
        supabase.from("ielts_writing_tasks").select("id,task_type,title,prompt").eq("needs_review", false).order("task_type").order("title"),
        supabase.auth.getUser(),
      ]);
      if (!active) return;
      if (taskError) setError(taskError.message);
      else setTasks((data as WritingTask[]) ?? []);
      setSignedIn(Boolean(auth.user));
    })();
    return () => { active = false; };
  }, [supabase]);

  useEffect(() => {
    if (!selected || !signedIn) return;
    let active = true;
    supabase.from("ielts_writing_submissions").select("body,feedback").eq("task_id", selected.id).maybeSingle().then(({ data }) => {
      if (!active || !data) return;
      setDraft(data.body ?? "");
      const saved = data.feedback as { text?: string } | null;
      setFeedback(saved?.text ?? "");
      setStatus(null);
    });
    return () => { active = false; };
  }, [selected?.id, signedIn, supabase]);

  async function save(body = draft, nextFeedback?: string) {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setStatus("Sign in to save this draft between visits."); return false; }
    if (!selected) return false;
    const payload = { user_id: auth.user.id, task_id: selected.id, body, feedback: nextFeedback ? { text: nextFeedback } : feedback ? { text: feedback } : null, updated_at: new Date().toISOString() };
    const { error: saveError } = await supabase.from("ielts_writing_submissions").upsert(payload, { onConflict: "user_id,task_id" });
    setStatus(saveError ? "The draft could not be saved. Please check your connection and try again." : "Draft saved to your account.");
    return !saveError;
  }

  async function getFeedback() {
    if (!selected || !draft.trim()) { setStatus("Write a draft before requesting feedback."); return; }
    setBusy(true); setStatus(null); setFeedback("");
    try {
      const response = await fetch("/api/ai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: `You are an IELTS writing practice coach, not an official examiner. Review this ${selected.task_type === "task1" ? "Task 1" : "Task 2"} draft against task achievement/response, coherence, vocabulary, and grammar. Give concise, actionable feedback, point out one strength and up to three specific improvements. Do not claim an official score. If offering an estimated band, clearly label it as unofficial.\n\nTask: ${selected.prompt}\n\nStudent draft:\n${draft.slice(0, 4500)}` }) });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.text ?? "Feedback could not be generated.");
      setFeedback(data.text ?? "No feedback was returned.");
      if (data.connected) await save(draft, data.text);
      else setStatus(data.text ?? "AI feedback is not connected yet.");
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : "Feedback could not be generated. Try again.");
    } finally { setBusy(false); }
  }

  if (tasks === null && !error) return <LoadingCard label="Loading writing assignments…" />;
  if (error) return <ErrorCard message={error} />;
  if (!tasks?.length) return <EmptyBank kind="IELTS Writing" />;

  return (
    <div className="grid gap-4 lg:grid-cols-[0.85fr,1.15fr]">
      <div className="card">
        <span className="pill border border-sky-400/20 bg-sky-400/[0.08] text-sky-300">WRITING BANK · {tasks.length} TASKS</span>
        <h2 className="mt-3 text-lg font-extrabold">Choose your assignment</h2>
        <div className="mt-4 space-y-2">
          {tasks.map((task) => (
            <button key={task.id} type="button" onClick={() => { setSelectedId(task.id); setDraft(""); setFeedback(""); setStatus(null); }} aria-pressed={selectedId === task.id} className={`w-full rounded-xl border p-3 text-left transition ${selectedId === task.id ? "border-accent/40 bg-accent/[0.1]" : "border-line bg-white/[0.02] hover:border-accent/25"}`}>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent-light">{task.task_type === "task1" ? "Task 1 · report" : "Task 2 · essay"}</span>
              <span className="mt-1 block text-sm font-bold">{task.title ?? "Writing practice"}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-ink-soft">Drafts are saved privately to your account when you choose Save draft. Word counts are guidance, not a score.</p>
      </div>
      <div className="card">
        {!selected ? <div className="grid min-h-60 place-items-center text-center"><div><span className="cosmic-orb mx-auto block h-14 w-14 rounded-full"/><p className="mt-4 text-sm font-semibold">Select a task to begin.</p></div></div> : <>
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="pill border border-accent/20 bg-accent/10 text-accent-light">{selected.task_type === "task1" ? "TASK 1" : "TASK 2"}</span><span className="text-xs text-ink-soft">{wordCount} words {selected.task_type === "task1" ? "· suggested minimum 150" : "· suggested minimum 250"}</span></div>
          <h2 className="mt-3 text-xl font-extrabold">{selected.title}</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-ink-soft">{selected.prompt}</p>
          <label htmlFor="ielts-writing-draft" className="mt-5 block text-sm font-bold">Your response</label>
          <textarea id="ielts-writing-draft" rows={12} maxLength={4500} value={draft} onChange={(event) => { setDraft(event.target.value); setStatus(null); }} placeholder="Plan your response, then write your draft here…" className="mt-2 resize-y leading-6" />
          <div className="mt-3 flex flex-wrap gap-2">
            {signedIn && <button type="button" disabled={busy} onClick={() => save()} className="btn-outline text-sm">Save draft</button>}
            <button type="button" disabled={busy || !draft.trim()} onClick={getFeedback} className="btn-primary text-sm">{busy ? "Reviewing…" : "Get practice feedback"}</button>
            {!signedIn && <Link href="/login?next=%2Fielts" className="btn-outline text-sm">Sign in to save</Link>}
          </div>
          {status && <p role="status" className="mt-3 text-sm text-ink-soft">{status}</p>}
          {feedback && <div className="card-flat mt-4 whitespace-pre-line text-sm leading-6"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-accent-light">Practice feedback · unofficial</span>{feedback}</div>}
        </>}
      </div>
    </div>
  );
}

function SpeakingTab() {
  const supabase = useMemo(() => createClient(), []);
  const [prompts, setPrompts] = useState<SpeakingPrompt[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.from("ielts_speaking_prompts").select("id,part,prompt").eq("needs_review", false).order("part").order("id").then(({ data, error: promptError }) => {
      if (!active) return;
      if (promptError) setError(promptError.message);
      else setPrompts((data as SpeakingPrompt[]) ?? []);
    });
    return () => { active = false; };
  }, [supabase]);

  function speak(text: string) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) { setError("Audio playback is not supported in this browser."); return; }
    window.speechSynthesis.cancel();
    const voice = window.speechSynthesis.getVoices().find((candidate) => /^en/i.test(candidate.lang));
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice?.lang ?? "en-US";
    if (voice) utterance.voice = voice;
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  }

  async function getFeedback(item: SpeakingPrompt) {
    if (!answers[item.id]?.trim()) return;
    setLoading(item.id); setError(null);
    try {
      const response = await fetch("/api/ai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: `You are an IELTS speaking practice coach, not an official examiner. Give brief actionable feedback (3-4 sentences) on fluency and coherence, vocabulary, and grammar. Then provide one unofficial estimated band from 0 to 9, clearly labelled as a practice estimate. Prompt (${item.part}): ${item.prompt}\nStudent answer: ${answers[item.id]}` }) });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.text ?? "Feedback could not be generated.");
      setFeedback((current) => ({ ...current, [item.id]: data.text ?? "No feedback was returned." }));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Feedback could not be generated. Try again."); }
    finally { setLoading(null); }
  }

  if (prompts === null && !error) return <LoadingCard label="Loading speaking prompts…" />;
  if (error && prompts === null) return <ErrorCard message={error} />;
  if (!prompts?.length) return <EmptyBank kind="IELTS Speaking" />;

  return <div className="space-y-4">
    {error && <ErrorCard message={error} />}
    <p className="text-xs leading-5 text-ink-soft">Audio uses your browser’s speech synthesis. Practice feedback requires the optional server-side AI key.</p>
    {prompts.map((item) => (
      <article key={item.id} className="card">
        <div className="flex flex-wrap items-center justify-between gap-3"><span className="pill border border-violet-400/20 bg-violet-400/[0.08] text-violet-300">{item.part}</span><button type="button" onClick={() => speak(item.prompt)} className="btn-outline px-4 py-2 text-sm">▶ Hear prompt</button></div>
        <h2 className="mt-4 text-base font-bold leading-6">{item.prompt}</h2>
        <label htmlFor={`speaking-answer-${item.id}`} className="sr-only">Your answer to {item.part}</label>
        <textarea id={`speaking-answer-${item.id}`} className="mt-3" rows={4} maxLength={2500} placeholder="Type the answer you would say…" value={answers[item.id] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [item.id]: event.target.value }))} />
        <button type="button" disabled={!answers[item.id]?.trim() || loading === item.id} onClick={() => getFeedback(item)} className="btn-primary mt-3 text-sm">{loading === item.id ? "Reviewing…" : "Get practice feedback"}</button>
        {feedback[item.id] && <div className="card-flat mt-3 whitespace-pre-line text-sm leading-6"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-accent-light">Practice feedback · unofficial</span>{feedback[item.id]}</div>}
      </article>
    ))}
  </div>;
}

function EmptyBank({ kind }: { kind: string }) {
  return <div className="card text-center"><span aria-hidden="true" className="cosmic-orb mx-auto block h-14 w-14 rounded-full"/><h2 className="mt-4 font-extrabold">No {kind} material is available yet.</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink-soft">Run the Supabase migrations in order, including <code>0005_question_bank_seed.sql</code>, to load the reviewed original practice set. Site setup status and material counts are visible in the admin tools.</p></div>;
}

function LoadingCard({ label }: { label: string }) { return <div role="status" className="card text-sm text-ink-soft">{label}</div>; }
function ErrorCard({ message }: { message: string }) { return <p role="alert" className="card-flat mb-4 border border-rose-400/20 bg-rose-500/[0.06] text-sm text-rose-200">Could not load this practice set: {message}</p>; }
