"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Essay = { id: string; title: string; prompt: string | null; body: string; feedback: string | null };

export default function EssaysPage() {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [active, setActive] = useState<Essay | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const supabase = createClient();

  async function load() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data } = await supabase.from("essays").select("*").order("created_at", { ascending: false });
    setEssays((data as Essay[]) ?? []);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createNew() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data } = await supabase
      .from("essays")
      .insert({ user_id: userData.user.id, title: "Untitled essay", body: "" })
      .select()
      .single();
    if (data) {
      setEssays([data as Essay, ...essays]);
      setActive(data as Essay);
    }
  }

  async function save(e: Essay) {
    await supabase.from("essays").update({ title: e.title, body: e.body, word_count: e.body.trim().split(/\s+/).filter(Boolean).length, updated_at: new Date().toISOString() }).eq("id", e.id);
    load();
  }

  async function getFeedback(e: Essay) {
    if (!e.body.trim()) {
      setNotice("Add a draft before requesting feedback.");
      return;
    }
    setLoadingFeedback(true);
    setNotice(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are a college essay coach. Give feedback on clarity, specificity, storytelling and structure (not a grade) for this draft, in 4-6 sentences. Never invent facts about the student. Prompt: "${e.prompt ?? "General personal statement"}". Draft:\n"""${e.body}"""`,
        }),
      });
      const data = await res.json();
      if (!res.ok || typeof data.text !== "string" || !data.text.trim()) {
        setNotice(typeof data.text === "string" ? data.text : "Feedback is unavailable right now. Please try again later.");
        return;
      }
      const { error } = await supabase.from("essays").update({ feedback: data.text }).eq("id", e.id);
      if (error) {
        setNotice("Feedback was generated, but could not be saved. Please try again.");
        return;
      }
      setActive({ ...e, feedback: data.text });
      setNotice("Feedback saved.");
    } catch {
      setNotice("Could not reach the feedback service. Please try again.");
    } finally {
      setLoadingFeedback(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <span className="text-sm font-bold text-accent-light">Essays &amp; Motivation Letters</span>
      <h1 className="mt-2 text-2xl font-extrabold">Write, get feedback, revise.</h1>
      <p className="mt-2 text-xs text-ink-soft">
        AI feedback here is a coaching tool, not a real admitted-student example — it never invents personal experiences for you.
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[280px,1fr]">
        <div className="card">
          <button onClick={createNew} className="btn-primary w-full">+ New Essay</button>
          <div className="mt-3 space-y-1">
            {essays.map((e) => (
              <button
                key={e.id}
                onClick={() => setActive(e)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${active?.id === e.id ? "bg-white/10" : ""}`}
              >
                {e.title}
              </button>
            ))}
          </div>
        </div>

        {active ? (
          <div className="card">
            <input
              className="text-lg font-bold"
              value={active.title}
              onChange={(e) => setActive({ ...active, title: e.target.value })}
            />
            <textarea
              className="mt-3"
              rows={12}
              value={active.body}
              onChange={(e) => setActive({ ...active, body: e.target.value })}
            />
            <div className="mt-3 flex gap-2">
              <button onClick={() => save(active)} className="btn-outline">Save</button>
              <button onClick={() => getFeedback(active)} disabled={loadingFeedback} className="btn-primary">
                {loadingFeedback ? "Thinking…" : "Get AI Feedback"}
              </button>
            </div>
            {notice && <p role="status" className="mt-3 text-sm text-ink-soft">{notice}</p>}
            {active.feedback && <div className="card-flat mt-4 text-sm">{active.feedback}</div>}
          </div>
        ) : (
          <div className="card-flat flex items-center justify-center text-ink-soft">Select or create an essay.</div>
        )}
      </div>
    </section>
  );
}
