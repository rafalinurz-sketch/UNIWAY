"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getUniversity } from "@/lib/data/universities";
import type { Profile } from "@/lib/types";

type Attempt = { id: string; test_type: string; score: number | null; completed_at: string | null };
type Tracked = { university_id: string; status: string };
type Plan = { target_university: string | null; target_major: string | null; target_sat: string | null; target_ielts: string | null; application_year: string | null };
const PROFILE_FIELDS: (keyof Pick<Profile, "name" | "gpa" | "sat" | "ielts" | "toefl" | "intended_major" | "target_countries">)[] = ["name", "gpa", "sat", "ielts", "toefl", "intended_major", "target_countries"];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [tracked, setTracked] = useState<Tracked[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let current = true;
    (async () => {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (!current) return;
      if (authError) {
        setError("We couldn’t check your sign-in status. Refresh the page and try again.");
        setLoading(false);
        return;
      }
      if (!userData.user) {
        setSignedIn(false);
        setLoading(false);
        return;
      }
      setSignedIn(true);
      const [profileRes, attemptsRes, trackedRes, planRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userData.user.id).maybeSingle(),
        supabase.from("user_attempts").select("id,test_type,score,completed_at", { count: "exact" }).order("completed_at", { ascending: false }).limit(20),
        supabase.from("application_tracker").select("university_id,status").order("created_at", { ascending: false }),
        supabase.from("study_plans").select("target_university,target_major,target_sat,target_ielts,application_year").eq("user_id", userData.user.id).maybeSingle(),
      ]);
      if (!current) return;
      const firstError = profileRes.error ?? attemptsRes.error ?? trackedRes.error ?? planRes.error;
      if (firstError) setError("Some dashboard information could not be loaded. Check your Supabase setup and try refreshing.");
      setProfile((profileRes.data as Profile | null) ?? null);
      setAttempts((attemptsRes.data as Attempt[] | null) ?? []);
      setAttemptCount(attemptsRes.count ?? 0);
      setTracked((trackedRes.data as Tracked[] | null) ?? []);
      setPlan((planRes.data as Plan | null) ?? null);
      setLoading(false);
    })();
    return () => { current = false; };
  }, [supabase]);

  const completion = useMemo(() => {
    const filled = PROFILE_FIELDS.filter((key) => Boolean(profile?.[key]?.trim())).length;
    return { filled, total: PROFILE_FIELDS.length, percent: Math.round((filled / PROFILE_FIELDS.length) * 100) };
  }, [profile]);

  if (loading) return <DashboardLoading />;
  if (signedIn === false) {
    return (
      <section className="mx-auto max-w-xl px-5 py-16 sm:px-8">
        <div className="card text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent/15 text-xl text-accent-light">◫</span>
          <h1 className="mt-4 text-2xl font-extrabold">Your admissions workspace</h1>
          <p className="mt-2 text-sm leading-6 text-ink-soft">Sign in to see your saved universities, study plan, and real practice history.</p>
          <Link href="/login?next=%2Fdashboard" className="btn-primary mt-6 inline-flex">Sign in</Link>
          <p className="mt-4 text-xs text-ink-soft">New to UniWay? <Link href="/signup" className="font-semibold text-accent-light">Create an account</Link></p>
        </div>
      </section>
    );
  }

  const satAttempts = attempts.filter((a) => a.test_type === "sat");
  const ieltsAttempts = attempts.filter((a) => a.test_type.startsWith("ielts"));
  const average = (items: Attempt[]) => {
    const scored = items.filter((item) => item.score !== null);
    return scored.length ? Math.round(scored.reduce((total, item) => total + (item.score ?? 0), 0) / scored.length) : null;
  };
  const actions = [
    completion.percent < 100 ? { title: "Complete your academic profile", detail: `${completion.total - completion.filled} of ${completion.total} profile fields are still blank.`, href: "/profile", label: "Update profile" } : null,
    tracked.length === 0 ? { title: "Choose universities to explore", detail: "Save a university to start building your application tracker.", href: "/universities", label: "Explore universities" } : null,
    !plan?.target_university && !plan?.target_major ? { title: "Set your admissions goals", detail: "Add a target, major, and application year to your personal plan.", href: "/study-plan", label: "Build a plan" } : null,
    !satAttempts.length ? { title: "Start SAT practice", detail: "Your dashboard will show results after you complete a practice session.", href: "/sat", label: "Open SAT practice" } : null,
    !ieltsAttempts.length ? { title: "Try an IELTS reading session", detail: "Only completed practice is included in your activity history.", href: "/ielts", label: "Open IELTS practice" } : null,
  ].filter((action): action is NonNullable<typeof action> => action !== null).slice(0, 3);

  return (
    <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-[#12152c] via-[#10162b] to-[#0b1020] p-6 sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent-light">Your workspace</span>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">Welcome{profile?.name?.trim() ? `, ${profile.name.trim()}` : " back"}.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">Your saved goals and practice history, all in one place.</p>
          </div>
          <Link href="/study-plan" className="btn-primary inline-flex items-center gap-2">Open study plan <span aria-hidden="true">→</span></Link>
        </div>
      </header>

      {error && <p role="status" className="card-flat mt-4 border-amber-400/20 bg-amber-500/[0.06] text-sm text-amber-200">{error}</p>}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Profile details" value={`${completion.percent}%`} detail={`${completion.filled} of ${completion.total} fields completed`} href="/profile" />
        <Metric label="Universities saved" value={tracked.length.toString()} detail="In your application tracker" href="/universities" />
        <Metric label="Practice sessions" value={attemptCount.toString()} detail="Completed and recorded" href="/sat" />
        <Metric label="Application year" value={plan?.application_year || "Not set"} detail={plan?.target_university || "Set a target in your plan"} href="/study-plan" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr,0.85fr]">
        <section className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><span className="text-xs font-bold uppercase tracking-wider text-ink-soft">Based on completed sessions</span><h2 className="mt-1 text-lg font-bold">Practice overview</h2></div>
            <Link href="/sat" className="text-sm font-semibold text-accent-light">Practice more →</Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <PracticeSummary title="SAT" count={satAttempts.length} average={average(satAttempts)} href="/sat" />
            <PracticeSummary title="IELTS" count={ieltsAttempts.length} average={average(ieltsAttempts)} href="/ielts" />
          </div>
          {attempts.length > 0 && (
            <div className="mt-5 border-t border-line pt-4">
              <h3 className="text-sm font-bold">Recent activity</h3>
              <ul className="mt-2 divide-y divide-line">
                {attempts.slice(0, 5).map((attempt) => (
                  <li key={attempt.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div><span className="font-semibold">{attempt.test_type.replaceAll("_", " ").toUpperCase()}</span><p className="mt-0.5 text-xs text-ink-soft">{attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString() : "Completed"}</p></div>
                    <span className="pill">{attempt.score === null ? "Score unavailable" : `${attempt.score}%`}</span>
                  </li>
                ))}
              </ul>
              {attemptCount > attempts.length && <p className="mt-2 text-xs text-ink-soft">Showing the latest {attempts.length} of {attemptCount} sessions.</p>}
            </div>
          )}
        </section>

        <section className="card">
          <div><span className="text-xs font-bold uppercase tracking-wider text-ink-soft">Suggested from your saved data</span><h2 className="mt-1 text-lg font-bold">Your next steps</h2></div>
          {actions.length ? (
            <div className="mt-4 space-y-3">
              {actions.map((action) => (
                <div key={action.href} className="rounded-xl border border-line bg-white/[0.025] p-4">
                  <h3 className="text-sm font-bold">{action.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-ink-soft">{action.detail}</p>
                  <Link href={action.href} className="mt-3 inline-flex text-xs font-bold text-accent-light">{action.label} →</Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] p-4">
              <p className="text-sm font-semibold">Your core profile and goals are filled in.</p>
              <p className="mt-1 text-xs leading-5 text-ink-soft">Keep your plan current as your test results and application priorities change.</p>
              <Link href="/study-plan" className="mt-3 inline-flex text-xs font-bold text-accent-light">Review your plan →</Link>
            </div>
          )}
        </section>
      </div>

      <section className="card mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><span className="text-xs font-bold uppercase tracking-wider text-ink-soft">Your shortlist</span><h2 className="mt-1 text-lg font-bold">Application tracker</h2></div>
          <Link href="/universities" className="btn-outline px-4 py-2 text-sm">Explore universities</Link>
        </div>
        {tracked.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink-soft">Saved universities will appear here when you add one from the directory.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {tracked.map((item) => {
              const university = getUniversity(item.university_id);
              return (
                <Link key={item.university_id} href={`/universities/${item.university_id}`} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white/[0.025] p-4 transition hover:border-accent/30">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold">{university?.name ?? item.university_id}</p><p className="mt-1 truncate text-xs text-ink-soft">{university ? `${university.city}, ${university.country}` : "Directory record unavailable"}</p></div>
                  <span className="pill shrink-0">{item.status}</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}

function Metric({ label, value, detail, href }: { label: string; value: string; detail: string; href: string }) {
  return <Link href={href} className="card-flat block transition hover:border-accent/25"><p className="text-xs font-semibold text-ink-soft">{label}</p><p className="mt-2 text-2xl font-extrabold tracking-tight">{value}</p><p className="mt-1 truncate text-xs text-ink-soft">{detail}</p></Link>;
}

function PracticeSummary({ title, count, average, href }: { title: string; count: number; average: number | null; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-line bg-white/[0.025] p-4 transition hover:border-accent/25">
      <div className="flex items-center justify-between"><span className="text-sm font-bold">{title}</span><span className="text-xs text-ink-soft">{count} session{count === 1 ? "" : "s"}</span></div>
      <p className="mt-4 text-2xl font-extrabold">{average === null ? "—" : `${average}%`}</p>
      <p className="mt-1 text-xs text-ink-soft">{average === null ? "No scored sessions yet" : `Average of ${count} recent recorded sessions`}</p>
    </Link>
  );
}

function DashboardLoading() {
  return <section aria-label="Loading dashboard" className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><div className="h-44 animate-pulse rounded-2xl bg-white/[0.04]" /><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl bg-white/[0.04]" />)}</div><div className="mt-5 h-72 animate-pulse rounded-2xl bg-white/[0.04]" /></section>;
}
