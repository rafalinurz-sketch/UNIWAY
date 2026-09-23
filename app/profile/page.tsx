"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

type ProfileFieldKey = keyof Pick<Profile, "name" | "gpa" | "sat" | "ielts" | "toefl" | "intended_major" | "target_countries">;
const FIELDS: { key: ProfileFieldKey; label: string; hint: string; placeholder: string }[] = [
  { key: "name", label: "Name", hint: "How you’d like to be addressed.", placeholder: "Your name" },
  { key: "gpa", label: "GPA or current grades", hint: "Use the scale from your school; don’t convert unless you know the equivalent.", placeholder: "For example, 3.7 / 4.0" },
  { key: "sat", label: "SAT score", hint: "Add your latest score, or leave blank until you have one.", placeholder: "Latest score" },
  { key: "ielts", label: "IELTS score", hint: "Enter a result only after taking the exam.", placeholder: "Latest band score" },
  { key: "toefl", label: "TOEFL score", hint: "Enter a result only after taking the exam.", placeholder: "Latest score" },
  { key: "intended_major", label: "Intended major", hint: "A broad subject is enough if you’re still deciding.", placeholder: "For example, computer science" },
  { key: "target_countries", label: "Target countries", hint: "Separate multiple countries with commas.", placeholder: "For example, Canada, Japan" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let current = true;
    (async () => {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (!current) return;
      if (authError) {
        setMessage({ type: "error", text: "We couldn’t check your sign-in status. Refresh the page and try again." });
        setLoading(false);
        return;
      }
      if (!userData.user) {
        setSignedIn(false);
        setLoading(false);
        return;
      }
      setSignedIn(true);
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userData.user.id).maybeSingle();
      if (!current) return;
      if (error) setMessage({ type: "error", text: "Your profile could not be loaded. Check your Supabase setup and try again." });
      else if (!data) setMessage({ type: "error", text: "A profile record was not found for this account. Ask an administrator to check the profile setup." });
      else setProfile(data as Profile);
      setLoading(false);
    })();
    return () => { current = false; };
  }, [supabase]);

  const filled = useMemo(() => FIELDS.filter(({ key }) => Boolean(profile?.[key]?.trim())).length, [profile]);
  const completion = Math.round((filled / FIELDS.length) * 100);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    const { id, ...values } = profile;
    const { error } = await supabase.from("profiles").update(values).eq("id", id);
    setSaving(false);
    setMessage(error
      ? { type: "error", text: `We couldn’t save your changes. ${error.message}` }
      : { type: "success", text: "Your profile has been saved." });
  }

  if (loading) return <section className="mx-auto max-w-3xl px-5 py-10 sm:px-8"><div className="h-40 animate-pulse rounded-2xl bg-white/[0.04]" /><div className="mt-5 h-96 animate-pulse rounded-2xl bg-white/[0.04]" /></section>;
  if (signedIn === false) {
    return <section className="mx-auto max-w-xl px-5 py-16 sm:px-8"><div className="card text-center"><h1 className="text-2xl font-extrabold">Your academic profile</h1><p className="mt-2 text-sm leading-6 text-ink-soft">Sign in to save your academic details and test goals.</p><Link href="/login?next=%2Fprofile" className="btn-primary mt-6 inline-flex">Sign in</Link><p className="mt-4 text-xs text-ink-soft">New here? <Link href="/signup" className="font-semibold text-accent-light">Create an account</Link></p></div></section>;
  }

  return (
    <section className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="grid gap-5 lg:grid-cols-[0.72fr,1.28fr]">
        <aside className="h-fit rounded-2xl border border-line bg-gradient-to-br from-[#171632] to-surface p-6 sm:p-7">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent-light">Your foundation</span>
          <h1 className="mt-3 text-2xl font-extrabold">Academic profile</h1>
          <p className="mt-3 text-sm leading-6 text-ink-soft">Keep your goals and latest results together. Blank fields stay blank until you add your own information.</p>
          <div className="mt-7 rounded-xl border border-white/10 bg-black/10 p-4">
            <div className="flex items-end justify-between gap-3"><span className="text-xs font-semibold text-ink-soft">Profile details</span><span className="text-xl font-extrabold">{completion}%</span></div>
            <div role="progressbar" aria-label="Profile details completed" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion} className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-accent to-blue-400 transition-all" style={{ width: `${completion}%` }} /></div>
            <p className="mt-2 text-xs text-ink-soft">{filled} of {FIELDS.length} fields filled</p>
          </div>
          <p className="mt-4 text-xs leading-5 text-ink-soft">This checklist describes profile completeness only. It does not estimate admission chances.</p>
        </aside>

        <form onSubmit={save} className="card space-y-5">
          <div><h2 className="text-lg font-bold">Your details</h2><p className="mt-1 text-sm text-ink-soft">Your profile is protected by account access controls.</p></div>
          {FIELDS.map(({ key, label, hint, placeholder }) => {
            const fieldId = `profile-${key}`;
            return (
              <div key={key}>
                <label htmlFor={fieldId} className="mb-1.5 block text-sm font-semibold">{label}</label>
                <input id={fieldId} name={key} autoComplete={key === "name" ? "name" : "off"} value={profile?.[key] ?? ""} placeholder={placeholder} onChange={(e) => { setProfile((current) => current ? { ...current, [key]: e.target.value } : current); setMessage(null); }} />
                <p className="mt-1.5 text-xs leading-5 text-ink-soft">{hint}</p>
              </div>
            );
          })}
          {message && <p role="status" className={`rounded-xl border p-3 text-sm ${message.type === "error" ? "border-red-400/20 bg-red-500/[0.06] text-red-200" : "border-emerald-400/20 bg-emerald-500/[0.06] text-emerald-200"}`}>{message.text}</p>}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <span className="text-xs text-ink-soft">Your profile is protected by account access controls.</span>
            <button type="submit" className="btn-primary" disabled={!profile || saving}>{saving ? "Saving…" : "Save profile"}</button>
          </div>
        </form>
      </div>
    </section>
  );
}
