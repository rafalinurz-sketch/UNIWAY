import Link from "next/link";
import type { Metadata } from "next";
import { getUniversity } from "@/lib/data/universities";

export const metadata: Metadata = { title: "Compare university records | UniWay", description: "Review current directory fields side by side. All listed university records need independent verification." };

type SearchParams = { ids?: string | string[] };

export default function CompareUniversitiesPage({ searchParams }: { searchParams?: SearchParams }) {
  const rawIds = Array.isArray(searchParams?.ids) ? searchParams.ids[0] : searchParams?.ids;
  const ids = Array.from(new Set((rawIds ?? "").split(",").filter(Boolean))).slice(0, 3);
  const universities = ids.map((id) => getUniversity(id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const rows: { label: string; value: (u: NonNullable<(typeof universities)[number]>) => string }[] = [
    { label: "Location", value: (u) => `${u.city}, ${u.country} · ${u.region}` },
    { label: "Institution type", value: (u) => u.type },
    { label: "Programs listed", value: (u) => u.majors.join(", ") },
    { label: "Minimum GPA", value: (u) => u.req.gpa },
    { label: "SAT", value: (u) => u.req.sat },
    { label: "IELTS", value: (u) => u.req.ielts },
    { label: "TOEFL", value: (u) => u.req.toefl },
    { label: "Application deadline", value: (u) => u.deadline },
    { label: "Application fee", value: (u) => u.applicationFee },
    { label: "Tuition", value: (u) => u.tuition },
    { label: "Scholarships listed", value: (u) => u.scholarships.length ? u.scholarships.map((s) => `${s.name} (${s.cov})`).join("; ") : "No details in this record" },
    { label: "Verification", value: (u) => `${u.dataStatus} · ${u.lastVerified}` },
    { label: "Record source", value: (u) => u.source },
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <Link href="/universities" className="text-sm font-semibold text-ink-soft hover:text-ink">← University explorer</Link>
      <span className="mt-5 block text-xs font-bold uppercase tracking-[0.18em] text-accent-light">Side-by-side review</span>
      <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">Compare university records.</h1>
      <div role="note" className="mt-5 rounded-xl border border-amber-300/20 bg-amber-400/[0.05] p-4 text-sm leading-6 text-amber-50/90">Comparison shows only fields present in the directory. Every record is marked “Needs Review”; confirm all requirements, costs, and deadlines with official sources.</div>

      {universities.length < 2 ? (
        <div className="card mt-5 text-center"><h2 className="font-bold">Choose at least two records</h2><p className="mt-2 text-sm text-ink-soft">Select up to three universities in the explorer, then compare the available fields here.</p><Link href="/universities" className="btn-primary mt-5 inline-flex">Back to explorer</Link></div>
      ) : (
        <div className="card mt-5 overflow-hidden p-0">
          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-white/[0.035]">
                  <th scope="col" className="sticky left-0 z-10 w-44 border-b border-line bg-surface p-4 text-xs font-bold uppercase tracking-wider text-ink-soft">Field</th>
                  {universities.map((u) => <th key={u.id} scope="col" className="min-w-[240px] border-b border-line p-4 align-top"><Link href={`/universities/${u.id}`} className="font-bold text-ink hover:text-accent-light">{u.name}</Link><span className="mt-2 block w-fit rounded-full border border-amber-300/15 bg-amber-400/[0.06] px-2 py-0.5 text-[10px] font-bold text-amber-100">Needs review</span></th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => <tr key={row.label} className="border-b border-line last:border-0"><th scope="row" className="sticky left-0 z-[1] bg-surface p-4 text-xs font-semibold text-ink-soft">{row.label}</th>{universities.map((u) => <td key={u.id} className="max-w-[320px] whitespace-normal p-4 align-top leading-6">{row.value(u)?.trim() || "Not available"}</td>)}</tr>)}
              </tbody>
            </table>
          </div>
          <p className="p-4 text-xs leading-5 text-ink-soft">Not available means this directory record does not provide the field; it does not mean the university has no requirement or funding option.</p>
        </div>
      )}
    </section>
  );
}
