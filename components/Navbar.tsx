"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import AuthArea from "./AuthArea";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "◫" },
  { href: "/universities", label: "Universities", icon: "◎" },
  { href: "/study-plan", label: "Study plan", icon: "↗" },
  { href: "/sat", label: "SAT practice", icon: "▤" },
  { href: "/ielts", label: "IELTS practice", icon: "◉" },
];

const MORE_LINKS = [
  { href: "/advisor", label: "AI advisor" },
  { href: "/essays", label: "Essays" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/scholarships", label: "Scholarships" },
];

function NavLink({ href, label, icon }: { href: string; label: string; icon?: string }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        active ? "bg-white/[0.09] text-ink" : "text-ink-soft hover:bg-white/[0.05] hover:text-ink"
      }`}
    >
      {icon && <span aria-hidden="true" className={`grid h-7 w-7 place-items-center rounded-lg text-base ${active ? "bg-accent/20 text-accent-light" : "text-ink-soft group-hover:text-ink"}`}>{icon}</span>}
      <span>{label}</span>
      {active && <span aria-hidden="true" className="ml-auto h-1.5 w-1.5 rounded-full bg-accent-light" />}
    </Link>
  );
}

export default function Navbar() {
  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-line bg-[rgba(5,8,22,0.94)] px-4 py-3 backdrop-blur-xl md:hidden">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/20 text-sm text-accent-light">U</span>
          UNIWAY
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <AuthArea compact />
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-[rgba(8,11,24,0.96)] px-4 py-5 backdrop-blur-xl md:flex">
        <Link href="/" className="flex items-center gap-3 px-2 font-display text-lg font-extrabold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-sm text-white shadow-lg shadow-accent/20">U</span>
          UNIWAY
        </Link>
        <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-soft/70">Workspace</p>
        <nav aria-label="Main navigation" className="flex flex-col gap-1">
          {LINKS.map((link) => <NavLink key={link.href} {...link} />)}
        </nav>
        <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-soft/70">Explore</p>
        <nav aria-label="More navigation" className="flex flex-col gap-1">
          {MORE_LINKS.map((link) => <NavLink key={link.href} {...link} />)}
        </nav>
        <div className="mt-auto border-t border-line pt-4">
          <div className="mb-3 flex items-center justify-between px-2">
            <span className="text-xs font-medium text-ink-soft">Appearance</span>
            <ThemeToggle />
          </div>
          <div className="rounded-xl bg-white/[0.04] p-2"><AuthArea /></div>
          <p className="px-2 pt-3 text-[10px] leading-relaxed text-ink-soft/70">Guidance, not a guarantee of admission.</p>
        </div>
      </aside>
    </>
  );
}
