import Link from "next/link";
import { UNIVERSITIES } from "@/lib/data/universities";

const WORKSPACE = [
  { href: "/universities", eyebrow: "01 / DISCOVER", title: "Find options worth exploring", desc: "Search the current directory by country, region, degree type and subject. Check every requirement with the university before you apply.", icon: "◎" },
  { href: "/study-plan", eyebrow: "02 / PLAN", title: "Turn goals into a roadmap", desc: "Save your target university, major, test goals and application year in one personal study plan.", icon: "↗" },
  { href: "/sat", eyebrow: "03 / PRACTICE", title: "Prepare with reviewed materials", desc: "Practice with questions added to the question bank. Unreviewed answers stay out of practice sessions.", icon: "▤" },
  { href: "/ielts", eyebrow: "04 / IMPROVE", title: "Build IELTS skills", desc: "Use your reading materials and speaking practice. Feedback is clearly marked as AI practice, not an official score.", icon: "◉" },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr,0.9fr] lg:py-24">
          <div>
            <span className="pill border border-accent/20 bg-accent/10 text-accent-light">A clearer admissions workspace</span>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.65rem]">
              Your path to the <span className="bg-gradient-to-r from-accent-light to-blue-400 bg-clip-text text-transparent">right university.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-ink-soft sm:text-lg">
              Explore university options, organize your admissions plan, and prepare for the SAT and IELTS in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/universities" className="btn-primary inline-flex items-center gap-2">Explore universities <span aria-hidden="true">→</span></Link>
              <Link href="/profile" className="btn-outline inline-flex items-center gap-2">Build my profile</Link>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-ink-soft">AI tools require an optional API connection. University records are a starting point; confirm admissions details with official sources.</p>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-accent/10 via-transparent to-blue-500/10 blur-xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020] shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /><span className="text-sm font-semibold text-white">Your admissions workspace</span></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">UNIWAY</span>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-2">
                <Link href="/profile" className="rounded-xl border border-white/10 bg-white/[0.035] p-4 transition hover:bg-white/[0.07]">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent-light">Profile</span>
                  <p className="mt-2 text-sm font-semibold text-white">Your academic details</p>
                  <p className="mt-1 text-xs text-white/50">Add goals and test scores</p>
                </Link>
                <Link href="/universities" className="rounded-xl border border-white/10 bg-white/[0.035] p-4 transition hover:bg-white/[0.07]">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Explore</span>
                  <p className="mt-2 text-sm font-semibold text-white">{UNIVERSITIES.length} records to review</p>
                  <p className="mt-1 text-xs text-white/50">Verify details with each university</p>
                </Link>
                <Link href="/study-plan" className="rounded-xl border border-white/10 bg-white/[0.035] p-4 transition hover:bg-white/[0.07]">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300">Plan</span>
                  <p className="mt-2 text-sm font-semibold text-white">Your next steps</p>
                  <p className="mt-1 text-xs text-white/50">Save targets and test goals</p>
                </Link>
                <Link href="/sat" className="rounded-xl border border-white/10 bg-white/[0.035] p-4 transition hover:bg-white/[0.07]">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Practice</span>
                  <p className="mt-2 text-sm font-semibold text-white">SAT &amp; IELTS</p>
                  <p className="mt-1 text-xs text-white/50">Progress appears as you practice</p>
                </Link>
              </div>
              <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
                <div className="h-px flex-1 bg-gradient-to-r from-accent/70 to-blue-400/70" />
                <span className="text-[10px] font-medium text-white/45">One step at a time</span>
                <div className="h-px flex-1 bg-gradient-to-l from-accent/70 to-blue-400/70" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent-light">A practical workflow</span>
          <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">From first search to a plan you can work on.</h2>
          <p className="mt-3 text-sm leading-6 text-ink-soft">Start with what you know. Add detail as you go. Your dashboard reflects saved data and recorded practice, without made-up readiness scores.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {WORKSPACE.map((item) => (
            <Link key={item.href} href={item.href} className="card group flex min-h-52 flex-col transition hover:-translate-y-1 hover:border-accent/30">
              <div className="flex items-center justify-between"><span className="text-xs font-bold tracking-wider text-ink-soft">{item.eyebrow}</span><span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05] text-lg text-accent-light group-hover:bg-accent/15">{item.icon}</span></div>
              <h3 className="mt-5 text-base font-bold leading-snug">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{item.desc}</p>
              <span className="mt-auto pt-5 text-sm font-semibold text-accent-light">Open workspace <span aria-hidden="true">→</span></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="card flex flex-col gap-5 border-accent/15 bg-gradient-to-br from-accent/[0.09] to-surface sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent-light">Keep your work together</span>
            <h2 className="mt-2 text-xl font-extrabold">A plan that starts with your real goals.</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">Create a profile, save universities to your application tracker, and keep practice history tied to your account.</p>
          </div>
          <Link href="/signup" className="btn-primary inline-flex shrink-0 items-center justify-center gap-2">Create your account <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </>
  );
}
