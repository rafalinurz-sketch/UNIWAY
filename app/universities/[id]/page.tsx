import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUniversity } from "@/lib/data/universities";
import AddToPlanButton from "@/components/AddToPlanButton";
import HowToApply from "@/components/HowToApply";

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const university = getUniversity(params.id);
  if (!university) return { title: "University record | UniWay", robots: { index: false, follow: false } };
  const description = `${university.name} directory record in ${university.country}. Details need independent verification; confirm current requirements with official sources.`;
  return { title: `${university.name} | UniWay`, description, openGraph: { title: `${university.name} | UniWay`, description, type: "article" } };
}

export default function UniversityPage({ params }: { params: { id: string } }) {
  const university = getUniversity(params.id);
  if (!university) return notFound();
  const officialUrl = getVerifiedUrl(university.officialSite);

  return (
    <>
      <section className="border-b border-line px-5 py-8 sm:px-8 sm:py-10" style={{ background: "var(--panel-bg)" }}>
        <div className="mx-auto max-w-5xl">
          <Link href="/universities" className="text-sm text-ink-soft hover:text-ink">← All universities</Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-extrabold sm:text-3xl">{university.name}</h1><span className="rounded-full border border-amber-300/20 bg-amber-400/[0.08] px-3 py-1 text-[11px] font-bold text-amber-100">Needs review</span></div>
              <p className="mt-2 text-sm text-ink-soft">{university.city}, {university.country} · {university.type}</p>
            </div>
            <div className="flex flex-wrap gap-2"><HowToApply u={university} /><AddToPlanButton universityId={university.id} /></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pt-6 sm:px-8">
        <div role="note" className="rounded-xl border border-amber-300/20 bg-amber-400/[0.05] p-4 text-sm leading-6 text-amber-50/90">
          This directory record has not been independently verified. Treat requirements, tuition, scholarships, and dates as unconfirmed; check the university’s own admissions pages before making decisions.
          {officialUrl ? <a href={officialUrl} target="_blank" rel="noreferrer" className="ml-1 font-semibold underline underline-offset-4">Visit the listed official site</a> : <span className="ml-1">No verified official website link is available in this record.</span>}
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-5">
          <div className="card">
            <h2 className="text-base font-bold">Admission requirements</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Minimum GPA" value={university.req.gpa} />
              <Field label="SAT" value={university.req.sat} />
              <Field label="IELTS" value={university.req.ielts} />
              <Field label="TOEFL" value={university.req.toefl} />
              <Field label="AP" value={university.req.ap} />
              <Field label="IB" value={university.req.ib} />
              <Field label="Acceptance information" value={university.acceptanceRate} />
              <Field label="Application deadline" value={university.deadline} />
            </div>
            <hr className="my-4 border-line" />
            <p className="mb-2 text-xs font-bold text-ink-soft">Required documents</p>
            {university.req.docs.length ? <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">{university.req.docs.map((document) => <li key={document}>{document}</li>)}</ul> : <p className="text-sm text-ink-soft">Not available in this record.</p>}
          </div>

          <div className="card">
            <h2 className="text-base font-bold">Programs listed</h2>
            {university.majors.length ? <div className="mt-3 flex flex-wrap gap-2">{university.majors.map((major) => <span key={major} className="pill">{major}</span>)}</div> : <p className="mt-2 text-sm text-ink-soft">Not available in this record.</p>}
          </div>

          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-bold">Scholarships</h2><span className="text-[10px] font-bold uppercase tracking-wider text-amber-100">Unverified</span></div>
            {!university.scholarships.length && <p className="mt-2 text-sm text-ink-soft">No scholarship details in this record.</p>}
            {university.scholarships.map((scholarship) => (
              <div key={scholarship.name} className="card-flat mt-3">
                <div className="flex justify-between gap-2"><b className="text-sm">{scholarship.name}</b><span className="pill">{scholarship.cov || "Coverage not available"}</span></div>
                <p className="mt-2 text-xs text-ink-soft">Eligibility: {scholarship.elig || "Not available"}</p>
                <p className="mt-1 text-xs text-ink-soft">Deadline: {scholarship.dl || "Not available"}</p>
              </div>
            ))}
          </div>

          {university.gksInfo && (
            <div className="card border-accent/30">
              <div className="flex flex-wrap items-center justify-between gap-2"><span className="pill">GKS listing</span><span className="text-[10px] font-bold uppercase tracking-wider text-amber-100">Unverified</span></div>
              <h2 className="mt-3 text-base font-bold">Global Korea Scholarship</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Eligible majors" value={university.gksInfo.eligible.join(", ")} />
                <Field label="Track" value={university.gksInfo.track} />
                <Field label="Coverage" value={university.gksInfo.coverage} />
                <Field label="Requirements" value={university.gksInfo.requirements} />
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <div className="card">
            <h2 className="text-base font-bold">At a glance</h2>
            <div className="mt-4 space-y-4"><Field label="Tuition" value={university.tuition} /><Field label="Application fee" value={university.applicationFee} /><Field label="Official website" value={officialUrl ? "Link shown above" : "Not verified in this record"} /></div>
          </div>
          <div className="card-flat text-xs leading-5">
            <b>Verification status:</b> {university.dataStatus || "Needs Review"}
            <p className="mt-2"><b>Last verified:</b> {university.lastVerified || "Not available"}</p>
            <p className="mt-2"><b>Record source:</b> {university.source || "Not available"}</p>
          </div>
          <div className="card-flat text-xs leading-5 text-ink-soft">Always confirm current admissions details, financial aid, and deadlines on the university’s official website.</div>
        </aside>
      </section>
    </>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return <div><div className="text-[11px] font-bold text-ink-soft">{label}</div><div className="mt-1 break-words text-sm font-semibold">{value?.trim() || "Not available"}</div></div>;
}

function getVerifiedUrl(value: string | null | undefined): string | null {
  if (!value || /illustrative|example|search the official/i.test(value)) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
