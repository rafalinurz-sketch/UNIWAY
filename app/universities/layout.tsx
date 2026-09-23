import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "University explorer | UniWay",
  description: "Search university directory records by country, region, type, or subject. Verify current admissions information with official sources.",
};

export default function UniversitiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
