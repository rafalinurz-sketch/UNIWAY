"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { IeltsPassage, IeltsReadingQuestion } from "@/lib/types";

const SPEAKING_CUES = [
  { part: "Part 1", q: "Do you enjoy reading books? What kind of books do you usually read?" },
  { part: "Part 2", q: "Describe a place you would like to visit in the future, and why it matters to you." },
  { part: "Part 3", q: "Do you think travel has become easier over the last few decades? Why or why not?" },
];

export default function IeltsPage() {
  const [tab, setTab] = useState<"reading" | "speaking">("reading");
  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <span className="text-sm font-bold text-accent-light">IELTS Preparation</span>
      <h1 className="mt-2 text-2xl font-extrabold">IELTS reading and speaking practice</h1>
      <p className="mt-2 text-sm text-ink-soft">Reading uses reviewed passages in the question bank. Speaking uses original UniWay sample prompts.</p>
      <div className="mt-5 flex gap-2">
        <button onClick={() => setTab("reading")} className={`pill ${tab === "reading" ? "bg-accent text-white" : ""}`}>
          Reading
        </button>
        <button onClick={() => setTab("speaking")} className={`pill ${tab === "speaking" ? "bg-accent text-white" : ""}`}>
          Speaking
        </button>
      </div>
      {tab === "reading" ? <ReadingTab /> : <SpeakingTab />}
    </section>
  );
}

function ReadingTab() {
  const [passages, setPassages] = useState<IeltsPassage[] | null>(null);
  const [selected, setSelected] = useState<IeltsPassage | null>(null);
  const [questions, setQuestions] = useState<IeltsReadingQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("ielts_reading_passages")
      .select("*")
      .eq("needs_review", false)
      .then(({ data }) => setPassages((data as IeltsPassage[]) ?? []));
  }, [supabase]);

  async function open(p: IeltsPassage) {
    setSelected(p);
    setResult(null);
    setAnswers({});
    const { data } = await supabase.from("ielts_reading_questions").select("*").eq("passage_id", p.id);
    setQuestions((data as IeltsReadingQuestion[]) ?? []);
  }

  async function submit() {
    let correct = 0;
    questions.forEach((q) => {
      if ((answers[q.id] ?? "").trim().toLowerCase() === (q.answer ?? "").trim().toLowerCase()) correct++;
    });
    setResult(`Score: ${correct}/${questions.length}`);
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      await supabase.from("user_attempts").insert({
        user_id: userData.user.id,
        test_type: "ielts_reading",
        test_id: selected?.id,
        score: questions.length ? Math.round((100 * correct) / questions.length) : 0,
        completed_at: new Date().toISOString(),
      });
    }
  }

  if (passages === null) return <p className="mt-6 text-ink-soft">Loading…</p>;
  if (passages.length === 0)
    return (
      <div className="card mt-6 text-center">
        <p className="font-semibold">Your question bank is currently empty.</p>
        <p className="mt-2 text-sm text-ink-soft">Import IELTS passages via /admin/import to see them here.</p>
      </div>
    );

  if (!selected) {
    return (
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {passages.map((p) => (
          <button key={p.id} onClick={() => open(p)} className="card text-left">
            <h3 className="font-bold">{p.title}</h3>
            <p className="mt-1 text-xs text-ink-soft">Click to open</p>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <div className="card">
        <button onClick={() => setSelected(null)} className="text-sm text-ink-soft">
          ← Back
        </button>
        <h3 className="mt-2 text-lg font-bold">{selected.title}</h3>
        <div className="mt-3 max-h-96 overflow-y-auto whitespace-pre-line text-sm leading-relaxed">{selected.text}</div>
      </div>
      <div className="card">
        <h3 className="font-bold">Questions</h3>
        <div className="mt-3 space-y-3">
          {questions.map((q, i) => (
            <div key={q.id} className="card-flat">
              <p className="text-sm font-semibold">
                {i + 1}. {q.question}
              </p>
              <input
                className="mt-2"
                placeholder="Your answer"
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <button onClick={submit} className="btn-primary mt-4 w-full">
          Submit Answers
        </button>
        {result && <p className="mt-3 text-center font-semibold">{result}</p>}
      </div>
    </div>
  );
}

function SpeakingTab() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<number | null>(null);

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    const voices = speechSynthesis.getVoices();
    const voice =
      voices.find((v) => /Google/i.test(v.name) && /^en/i.test(v.lang)) ?? voices.find((v) => /^en/i.test(v.lang)) ?? voices[0];
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
  }

  async function getFeedback(idx: number) {
    setLoading(idx);
    const cue = SPEAKING_CUES[idx];
    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({
        prompt: `You are an IELTS speaking examiner. ${cue.part} question: "${cue.q}". Student's written version of their spoken answer: "${answers[idx] ?? ""}". Give brief feedback (3-4 sentences) on fluency/coherence, vocabulary and grammar, then one estimated band (0-9).`,
      }),
    });
    const data = await res.json();
    setFeedback((f) => ({ ...f, [idx]: data.text }));
    setLoading(null);
  }

  return (
    <div className="mt-5 space-y-5">
      <p className="text-xs text-ink-soft">
        These are original UniWay practice prompts. Voice uses your browser&apos;s built-in speech synthesis. Feedback needs{" "}
        <code>ANTHROPIC_API_KEY</code> set on the server; otherwise it will say plainly that AI isn&apos;t connected.
      </p>
      {SPEAKING_CUES.map((c, i) => (
        <div key={i} className="card">
          <div className="flex items-start justify-between gap-3">
            <span className="pill">{c.part}</span>
            <button onClick={() => speak(c.q)} className="pill">
              ▶ Hear question
            </button>
          </div>
          <p className="mt-2 font-semibold">{c.q}</p>
          <textarea
            className="mt-2"
            rows={4}
            placeholder="Type what you would say..."
            value={answers[i] ?? ""}
            onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
          />
          <button onClick={() => getFeedback(i)} disabled={loading === i} className="btn-outline mt-2 text-sm">
            {loading === i ? "Thinking…" : "Get Feedback"}
          </button>
          {feedback[i] && <div className="card-flat mt-3 text-sm">{feedback[i]}</div>}
        </div>
      ))}
    </div>
  );
}
