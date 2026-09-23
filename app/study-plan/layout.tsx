import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admissions plan | UniWay", robots: { index: false, follow: false } };

export default function StudyPlanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
