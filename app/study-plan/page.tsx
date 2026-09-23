"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Plan = {
  target_university: string;
  target_major: string;
  target_sat: string;
  target_ielts: string;
  application_year: string;
  generated_plan: { phases: { title: string; items: string[] }[] } | null;
};

export default function StudyPlanPage() {
  const [plan, setPlan] = useState<Plan>({ target_university: "", target_major: "", target_sat: "", target_ielts: "", application_year: "", generated_plan: null });
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return setSignedIn(false);
      setSignedIn(true);
      const { data } = await supabase.from("study_plans").select("*").eq("user_id", userData.user.id).maybeSingle();
      if (data) setPlan(data as Plan);
    })();
  }, [supabase]);

  async function save() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return setMessage({ type: "error", text: "Sign in again to save your plan." });
    setSaving(true);
    setMessage(null);
    const { error } = await supabase.from("study_plans").upsert({ user_id: userData.user.id, ...plan, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    setSaving(false);
    setMessage(error ? { type: "error", text: `Your plan could not be saved. ${error.message}` } : { type: "success", text: "Your plan has been saved." });
  }

  async function generate() {
    setGenerating(true);
    try {
      setMessage(null);
      const prompt = `Create a practical admissions roadmap for a student targeting ${plan.target_university || "a university they will choose"}, major ${plan.target_major || "undecided"}, target SAT ${plan.target_sat || "not entered"}, target IELTS ${plan.target_ielts || "not entered"}, application year ${plan.application_year || "not entered"}. Do not invent school requirements, dates, or scores. Return only JSON in this shape: {"phases":[{"title":"This Month","items":["..."]},{"title":"Next 3 Months","items":["..."]},{"title":"Before Application","items":["..."]}]}`;
      const res = await fetch("/api/ai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt }) });
      const data = await res.json();
      if (!res.ok || !data.connected || data.error) throw new Error(data.text || "AI generation is not available right now.");
      const generated = JSON.parse(data.text);
      if (!Array.isArray(generated?.phases) || !generated.phases.every((phase: { title?: unknown; items?: unknown }) => typeof phase.title === "string" && Array.isArray(phase.items) && phase.items.every((item: unknown) => typeof item === "string"))) {
        throw new Error("The AI response was not in the expected format. Try generating the plan again.");
      }
      const next = { ...plan, generated_plan: generated as Plan["generated_plan"] };
      setPlan(next);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Sign in again to save your generated plan.");
      const { error } = await supabase.from("study_plans").upsert({ user_id: userData.user.id, ...next, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (error) throw new Error(`The plan was generated but could not be saved. ${error.message}`);
      setMessage({ type: "success", text: "AI-generated suggestions saved to your plan. Review each step against official requirements and your schedule." });
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Could not generate the plan. Please try again." });
    } finally {
      setGenerating(false);
    }
  }

  if (signedIn === null) return <section className="mx-auto max-w-3xl px-5 py-10 sm:px-8"><div className="h-48 animate-pulse rounded-2xl bg-white/[0.04]" /></section>;
  if (signedIn === false) return <section className="mx-auto max-w-xl px-5 py-16 sm:px-8"><div className="card text-center"><h1 className="text-2xl font-extrabold">Your admissions plan</h1><p className="mt-2 text-sm text-ink-soft">Sign in to save goals and generated planning notes.</p><Link href="/login?next=%2Fstudy-plan" className="btn-primary mt-5 inline-flex">Sign in</Link></div></section>;

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent-light">Admissions roadmap</span>
      <h1 className="mt-2 text-2xl font-extrabold">Plan around your goals.</h1>
      <p className="mt-2 text-sm leading-6 text-ink-soft">These details are saved to your account. AI-generated suggestions appear only when the server AI connection is configured.</p>
      <div className="card mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Target university" value={plan.target_university} onChange={(v) => setPlan({ ...plan, target_university: v })} />
        <Field label="Target major" value={plan.target_major} onChange={(v) => setPlan({ ...plan, target_major: v })} />
        <Field label="Target SAT" value={plan.target_sat} onChange={(v) => setPlan({ ...plan, target_sat: v })} />
        <Field label="Target IELTS" value={plan.target_ielts} onChange={(v) => setPlan({ ...plan, target_ielts: v })} />
        <Field label="Application year" value={plan.application_year} onChange={(v) => setPlan({ ...plan, application_year: v })} />
      </div>
      <div className="mt-4 flex gap-3">
        <button onClick={save} disabled={saving} className="btn-outline">{saving ? "Saving…" : "Save goals"}</button>
        <button onClick={generate} disabled={generating} className="btn-primary">
          {generating ? "Generating…" : "Generate AI suggestions"}
        </button>
      </div>

      {message && <p role="status" className={`mt-4 rounded-xl border p-3 text-sm ${message.type === "error" ? "border-red-400/20 bg-red-500/[0.06] text-red-200" : "border-emerald-400/20 bg-emerald-500/[0.06] text-emerald-200"}`}>{message.text}</p>}

      {plan.generated_plan && (
        <div className="mt-6 space-y-4">
          <p className="text-xs leading-5 text-ink-soft">AI-generated planning suggestions · not verified admissions requirements or official deadlines.</p>
          {plan.generated_plan.phases.map((ph) => (
            <div key={ph.title} className="card-flat">
              <b className="text-sm">{ph.title}</b>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                {ph.items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-ink-soft">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
