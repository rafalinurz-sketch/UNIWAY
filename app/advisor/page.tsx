"use client";

import { useState } from "react";

type Msg = { role: "user" | "ai"; text: string };

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Hi! Ask me about universities, exams, scholarships or strategy." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function send(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setSending(true);
    const context = `You are the UNIWAY admissions planning assistant. Give practical, careful guidance. Do not invent university requirements, rankings, deadlines, scholarship amounts, or admission probabilities. The UniWay directory may contain unverified records; ask the student to confirm institution-specific facts on official university sources. Distinguish general suggestions from confirmed information. Student question: ${text}`;
    try {
      const res = await fetch("/api/ai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: context }) });
      const data = await res.json();
      setMessages((m) => [...m, { role: "ai", text: data.text ?? "The assistant could not return a response. Please try again." }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "The assistant could not connect. Please try again." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <span className="text-sm font-bold text-accent-light">AI Advisor</span>
      <h1 className="mt-2 text-2xl font-extrabold">Ask anything about admissions.</h1>
      <div className="card mt-5 flex flex-col p-4">
        <div className="flex h-[420px] flex-col gap-3 overflow-y-auto p-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user" ? "self-end bg-accent text-white" : "self-start bg-white/5"
              }`}
            >
              {m.text}
            </div>
          ))}
          {sending && <div className="self-start text-sm text-ink-soft">Thinking…</div>}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask about universities, exams, scholarships..."
          />
          <button onClick={() => send(input)} className="btn-primary">
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
