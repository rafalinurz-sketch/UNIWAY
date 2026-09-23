"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    if (data.user) {
      // profiles row is created automatically by the handle_new_user trigger
      // in supabase/migrations/0002_profiles.sql — we just set the display name.
      await supabase.from("profiles").update({ name }).eq("id", data.user.id);
    }
    setLoading(false);
    if (!data.session) {
      setNotice("Check your email to confirm your account, then sign in.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-center text-2xl font-extrabold">Create your account</h1>
      <p className="mt-2 text-center text-ink-soft">Start tracking your path to the world&apos;s best universities.</p>
      <form onSubmit={onSubmit} className="card mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-ink-soft">Name</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-ink-soft">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-ink-soft">Password (min 6 characters)</label>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
        {notice && <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400">{notice}</p>}
        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account…" : "Create Account"}
        </button>
        <p className="text-center text-sm">
          Already have an account? <Link href="/login" className="font-bold text-accent-light">Sign in</Link>
        </p>
      </form>
      <p className="mt-4 text-center text-xs text-ink-soft">
        Google/Apple sign-in isn&apos;t wired up yet — enable those providers in Supabase Dashboard → Authentication →
        Providers, then add the buttons back with <code>supabase.auth.signInWithOAuth()</code>.
      </p>
    </section>
  );
}
