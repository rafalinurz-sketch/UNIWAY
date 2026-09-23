import Link from "next/link";
import type { University } from "@/lib/types";

export default function UniversityCard({ u, compareSelected = false, onCompare }: { u: University; compareSelected?: boolean; onCompare?: (id: string) => void }) {
  return (
    <article className="card group flex flex-col transition hover:-translate-y-1 hover:border-accent/25">
      <Link href={`/universities/${u.id}`} className="flex flex-1 flex-col rounded-md focus-visible:outline-2 focus-visible:outline-accent-light">
        <div className="flex items-start justify-between gap-3">
          <div><h3 className="text-base font-bold leading-snug group-hover:text-accent-light">{u.name}</h3><p className="mt-1 text-xs text-ink-soft">{u.city}, {u.country}</p></div>
          <span className="shrink-0 rounded-full border border-amber-300/15 bg-amber-400/[0.06] px-2.5 py-1 text-[10px] font-bold text-amber-100">Needs review</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">{u.majors.slice(0, 2).map((m) => <span key={m} className="pill max-w-full truncate">{m}</span>)}{u.majors.length > 2 && <span className="pill">+{u.majors.length - 2}</span>}</div>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4 text-xs font-semibold text-ink-soft"><span className="truncate">{u.type}</span><span className="shrink-0">{u.gks ? "GKS record" : u.region}</span></div>
        <span className="mt-3 text-xs font-bold text-accent-light">Review record <span aria-hidden="true">→</span></span>
      </Link>
      {onCompare && <button type="button" aria-pressed={compareSelected} onClick={() => onCompare(u.id)} className={`mt-4 min-h-10 rounded-xl border px-3 text-xs font-semibold transition ${compareSelected ? "border-accent/40 bg-accent/10 text-accent-light" : "border-line text-ink-soft hover:text-ink"}`}>{compareSelected ? "Added to comparison ✓" : "Add to comparison"}</button>}
    </article>
  );
}
