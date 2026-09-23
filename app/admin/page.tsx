import Link from "next/link";

const LINKS = [
  { href: "/admin/scan", title: "Scan & Status", desc: "Check Supabase connection, bucket files, and table row counts." },
  { href: "/admin/import", title: "Import CSV/JSON", desc: "Turn structured SAT/IELTS files into Database rows." },
  { href: "/admin/review", title: "Review Queue", desc: "Confirm or fix questions flagged needs_review." },
  { href: "/admin/database", title: "Database", desc: "Row counts across every content table." },
  { href: "/admin/storage", title: "Storage", desc: "Browse the sat, ielts and files buckets." },
  { href: "/admin/users", title: "Users", desc: "View profiles and grant/revoke admin access." },
];

export default function AdminHome() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <span className="text-sm font-bold text-accent-light">Admin</span>
      <h1 className="mt-2 text-2xl font-extrabold">SAT &amp; IELTS materials pipeline.</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Storage (your files) → parsing → Database (structured questions) → Practice Tests. Nothing here invents content.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="card-flat block">
            <b>{l.title}</b>
            <p className="mt-1 text-xs text-ink-soft">{l.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
