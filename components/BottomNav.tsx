"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Home", icon: "⌂" },
  { href: "/universities", label: "Universities", icon: "◎" },
  { href: "/study-plan", label: "Plan", icon: "↗" },
  { href: "/sat", label: "Practice", icon: "▤" },
  { href: "/profile", label: "Profile", icon: "○" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-[rgba(8,11,24,0.97)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md justify-between">
        {LINKS.map((link) => {
          const active = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(`${link.href}/`));
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-semibold transition ${active ? "text-accent-light" : "text-ink-soft"}`}
            >
              <span aria-hidden="true" className="text-lg leading-5">{link.icon}</span>
              <span className="max-w-full truncate">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
