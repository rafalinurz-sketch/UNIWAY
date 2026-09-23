"use client";

import { useMemo, useState } from "react";
import { UNIVERSITIES, countriesList, regionsList } from "@/lib/data/universities";
import UniversityCard from "@/components/UniversityCard";
import Link from "next/link";

type SortMode = "name" | "country" | "region";

export default function UniversitiesPage() {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [major, setMajor] = useState("");
  const [institutionType, setInstitutionType] = useState("");
  const [gksOnly, setGksOnly] = useState(false);
  const [sort, setSort] = useState<SortMode>("name");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareNotice, setCompareNotice] = useState<string | null>(null);

  const majors = useMemo(() => Array.from(new Set(UNIVERSITIES.flatMap((u) => u.majors))).filter(Boolean).sort((a, b) => a.localeCompare(b)), []);
  const institutionTypes = useMemo(() => Array.from(new Set(UNIVERSITIES.map((u) => u.type))).filter(Boolean).sort((a, b) => a.localeCompare(b)), []);
  const filtered = useMemo(() => {
    const query = q.trim().toLocaleLowerCase();
    const results = UNIVERSITIES.filter((u) => {
      const searchable = [u.name, u.country, u.city, u.region, ...u.majors].join(" ").toLocaleLowerCase();
      if (query && !searchable.includes(query)) return false;
      if (country && u.country !== country) return false;
      if (region && u.region !== region) return false;
      if (major && !u.majors.includes(major)) return false;
      if (institutionType && u.type !== institutionType) return false;
      if (gksOnly && !u.gks) return false;
      return true;
    });
    const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
    return results.sort((a, b) => sort === "country" ? collator.compare(a.country, b.country) || collator.compare(a.name, b.name) : sort === "region" ? collator.compare(a.region, b.region) || collator.compare(a.name, b.name) : collator.compare(a.name, b.name));
  }, [q, country, region, major, institutionType, gksOnly, sort]);

  const hasFilters = Boolean(q || country || region || major || institutionType || gksOnly);
  function clearFilters() {
    setQ(""); setCountry(""); setRegion(""); setMajor(""); setInstitutionType(""); setGksOnly(false); setSort("name");
  }
  function toggleCompare(id: string) {
    setCompareNotice(null);
    if (compareIds.includes(id)) return setCompareIds(compareIds.filter((item) => item !== id));
    if (compareIds.length >= 3) return setCompareNotice("Compare up to three records at a time.");
    setCompareIds([...compareIds, id]);
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><span className="text-xs font-bold uppercase tracking-[0.18em] text-accent-light">University explorer</span><h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">Find places to explore.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">Search by location or subject, then open each record to check its source and verification status.</p></div>
        <span className="pill border border-amber-300/15 bg-amber-400/[0.06] text-amber-100">{UNIVERSITIES.length} records · needs review</span>
      </div>

      <div className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-400/[0.045] p-4 sm:p-5">
        <div className="flex items-start gap-3"><span aria-hidden="true" className="mt-0.5 text-amber-200">ⓘ</span><div><h2 className="text-sm font-bold text-amber-100">Use this directory as a starting point</h2><p className="mt-1 text-xs leading-5 text-ink-soft">Every current record is marked “Needs Review.” Requirements, costs, scholarships, and dates are not independently verified here. Confirm current details on an official university website before making decisions.</p></div></div>
      </div>

      <div className="card mt-5 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3"><label htmlFor="university-search" className="mb-1.5 block text-xs font-semibold text-ink-soft">Search universities and subjects</label><input id="university-search" type="search" placeholder="Name, country, city, region or major" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <Filter label="Country" value={country} onChange={setCountry} options={countriesList()} allLabel="All countries" />
          <Filter label="Region" value={region} onChange={setRegion} options={regionsList()} allLabel="All regions" />
          <Filter label="Subject" value={major} onChange={setMajor} options={majors} allLabel="All subjects" />
          <Filter label="Institution type" value={institutionType} onChange={setInstitutionType} options={institutionTypes} allLabel="All types" />
          <div><label htmlFor="university-sort" className="mb-1.5 block text-xs font-semibold text-ink-soft">Sort by</label><select id="university-sort" value={sort} onChange={(e) => setSort(e.target.value as SortMode)}><option value="name">Name</option><option value="country">Country</option><option value="region">Region</option></select></div>
          <div className="flex items-end gap-2">
            <button type="button" aria-pressed={gksOnly} onClick={() => setGksOnly((value) => !value)} className={`min-h-11 flex-1 rounded-xl border px-3 text-sm font-semibold transition ${gksOnly ? "border-accent/40 bg-accent/15 text-white" : "border-line bg-surface-2 text-ink-soft hover:text-ink"}`}>GKS records</button>
            {hasFilters && <button type="button" onClick={clearFilters} className="min-h-11 px-3 text-sm font-semibold text-accent-light">Clear</button>}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3"><p aria-live="polite" className="text-sm text-ink-soft">Showing <strong className="text-ink">{filtered.length}</strong> of {UNIVERSITIES.length} records</p>{hasFilters && <span className="text-xs text-ink-soft">Filters apply to the current directory</span>}</div>
      {compareIds.length > 0 && (
        <div className="card-flat mt-4 flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-sm font-bold">Comparison list · {compareIds.length}/3</p><p className="mt-1 text-xs text-ink-soft">{compareIds.map((id) => UNIVERSITIES.find((item) => item.id === id)?.name ?? id).join(" · ")}</p>{compareNotice && <p role="status" className="mt-1 text-xs text-amber-200">{compareNotice}</p>}</div>
          <div className="flex items-center gap-3"><button type="button" onClick={() => { setCompareIds([]); setCompareNotice(null); }} className="text-xs font-semibold text-ink-soft">Clear</button>{compareIds.length >= 2 ? <Link href={`/universities/compare?ids=${compareIds.map(encodeURIComponent).join(",")}`} className="btn-primary px-4 py-2 text-sm">Compare records</Link> : <span className="text-xs text-ink-soft">Add one more to compare</span>}</div>
        </div>
      )}
      {filtered.length ? <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((u) => <UniversityCard key={u.id} u={u} compareSelected={compareIds.includes(u.id)} onCompare={toggleCompare} />)}</div> : <div className="card-flat mt-4 py-12 text-center"><h2 className="font-bold">No matching records</h2><p className="mt-2 text-sm text-ink-soft">Try a broader search or clear one of the filters.</p><button type="button" onClick={clearFilters} className="btn-outline mt-4 text-sm">Clear filters</button></div>}
    </section>
  );
}

function Filter({ label, value, onChange, options, allLabel }: { label: string; value: string; onChange: (value: string) => void; options: string[]; allLabel: string }) {
  const id = `university-filter-${label.toLowerCase().replaceAll(" ", "-")}`;
  return <div><label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-ink-soft">{label}</label><select id={id} value={value} onChange={(e) => onChange(e.target.value)}><option value="">{allLabel}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>;
}
