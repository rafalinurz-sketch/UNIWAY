import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "UniWay — University admissions and test preparation",
  description: "Explore university options, organize admissions work, and practice for the SAT and IELTS in one workspace.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="pb-20 md:pb-0">
        <a href="#main-content" className="sr-only fixed left-4 top-4 z-[100] rounded-lg bg-surface px-4 py-3 text-sm font-bold text-ink focus:not-sr-only">Skip to content</a>
        <Navbar />
        <main id="main-content" className="min-h-[calc(100vh-4rem)] md:pl-64">{children}</main>
        <footer className="border-t border-line bg-bg-alt px-6 py-8 text-sm text-ink-soft md:ml-64">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3">
            <span>© 2026 UNIWAY. Guidance, not a guarantee of admission.</span>
            <span>Verify every requirement and deadline on official sources.</span>
          </div>
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}
