import type { Metadata } from "next";

export const metadata: Metadata = { title: "Essays | UniWay", robots: { index: false, follow: false } };

export default function EssaysLayout({ children }: { children: React.ReactNode }) {
  return children;
}
