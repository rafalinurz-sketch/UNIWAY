"use client";

import { useState } from "react";
import type { University } from "@/lib/types";

export default function HowToApply({ u }: { u: University }) {
  const [open, setOpen] = useState(false);
  const steps = [
    { t: "Check eligibility", d: `Confirm your profile fits ${u.name}: GPA around ${u.req.gpa}.` },
    { t: "Choose your program", d: `Shortlist a major from ${u.majors.slice(0, 3).join(", ")}.` },
    { t: "Prepare academic documents", d: "Transcripts, certificates, translations if needed." },
    { t: "Prepare standardized tests", d: `Typical range: SAT ${u.req.sat}.` },
    { t: "Prepare English proficiency test", d: `IELTS ${u.req.ielts} or TOEFL ${u.req.toefl} is typical — confirm the exact minimum officially.` },
    { t: "Build your extracurricular profile", d: "Leadership, research, volunteering, competitions." },
    { t: "Prepare essays / personal statement", d: "Start several drafts before the deadline." },
    { t: "Request recommendation letters", d: "Ask at least a month ahead." },
    { t: "Submit your application", d: `Deadline window: ${u.deadline}.` },
    { t: "Apply for scholarships / financial aid", d: `Check ${u.scholarships[0]?.name ?? "available aid"}.` },
    { t: "Interview (if required)", d: "Prepare specific examples from your activities." },
    { t: "Wait for your admission decision", d: "Track status through the applicant portal." },
  ];

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary text-sm px-4 py-2">
        How to Apply
      </button>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-5" onClick={() => setOpen(false)}>
          <div className="card max-h-[80vh] w-full max-w-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">How to Apply — {u.name}</h3>
              <button onClick={() => setOpen(false)} className="pill">
                Close
              </button>
            </div>
            {steps.map((s, i) => (
              <div key={s.t} className="mb-4 flex gap-3">
                <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {i + 1}
                </div>
                <div>
                  <b className="text-sm">{s.t}</b>
                  <p className="mt-1 text-xs text-ink-soft">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
