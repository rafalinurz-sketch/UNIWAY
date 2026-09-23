"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SatQuestion } from "@/lib/types";

type Answer = { questionId: string; correct: boolean; selected: number };

export default function SatQuiz({ questions, onExit }: { questions: SatQuestion[]; onExit: () => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [attemptStatus, setAttemptStatus] = useState<string | null>(null);
  const supabase = createClient();

  const q = questions[index];

  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
  }

  async function next() {
    const correct = picked === q.correct_index;
    const updated = [...answers, { questionId: q.id, correct, selected: picked! }];
    setAnswers(updated);
    setPicked(null);
    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      setDone(true);
      setAttemptStatus("Saving your practice result…");
      setAttemptStatus(await saveAttempt(updated));
    }
  }

  async function saveAttempt(finalAnswers: Answer[]): Promise<string> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return "Sign in to save this result to your practice history.";
    const score = Math.round((100 * finalAnswers.filter((a) => a.correct).length) / finalAnswers.length);
    const { data: attempt, error } = await supabase
      .from("user_attempts")
      .insert({ user_id: userData.user.id, test_type: "sat", score, completed_at: new Date().toISOString() })
      .select()
      .single();
    if (error || !attempt) return "Your score could not be saved. Check your connection and try again.";
    const { error: answerError } = await supabase.from("user_answers").insert(
      finalAnswers.map((a) => ({
        attempt_id: attempt.id,
        question_table: "sat_questions",
        question_id: a.questionId,
        selected_answer: String(a.selected),
        is_correct: a.correct,
      }))
    );
    if (answerError) return "Your score was saved, but answer details could not be recorded.";
    return "Result saved to your practice history.";
  }

  if (done) {
    const correct = answers.filter((a) => a.correct).length;
    return (
      <div className="card text-center">
        <h2 className="text-xl font-extrabold">You got {correct} of {answers.length} correct</h2>
        <p className="mt-2 text-sm text-ink-soft">Practice-set accuracy only; this is not an official or scaled SAT score.</p>
        {attemptStatus && <p role="status" className="mt-3 text-xs text-ink-soft">{attemptStatus}</p>}
        <button onClick={onExit} className="btn-primary mt-5">
          Back to SAT Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="pill">
          Question {index + 1} / {questions.length}
        </span>
        <span className="pill">{q.topic}</span>
      </div>
      <div className="card">
        <div className="mb-2 text-xs font-bold text-ink-soft">
          {q.difficulty?.toUpperCase()} · {q.section === "math" ? "MATH" : "READING & WRITING"}
        </div>
        <h3 className="text-lg font-bold">{q.question}</h3>
        <div className="mt-4 flex flex-col gap-2">
          {q.choices.map((c, i) => {
            const isCorrect = picked !== null && i === q.correct_index;
            const isWrong = picked === i && i !== q.correct_index;
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                className={`rounded-xl border px-4 py-3 text-left text-sm ${
                  isCorrect ? "border-emerald-500 bg-emerald-500/10" : isWrong ? "border-red-500 bg-red-500/10" : "border-line"
                }`}
              >
                {String.fromCharCode(65 + i)}. {c}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className="mt-4 rounded-xl bg-white/5 p-4 text-sm">
            <b className={picked === q.correct_index ? "text-emerald-400" : "text-red-400"}>
              {picked === q.correct_index ? "Correct!" : "Not quite."}
            </b>
            {q.correct_index === null ? (
              <p className="mt-1 text-ink-soft">
                This question hasn&apos;t been reviewed yet, so no confirmed answer is on file — check Admin/Review.
              </p>
            ) : (
              <p className="mt-1 text-ink-soft">{q.explanation ?? "No explanation was extracted for this question."}</p>
            )}
          </div>
        )}
        <div className="mt-5 flex justify-end">
          <button onClick={next} disabled={picked === null} className="btn-primary">
            {index < questions.length - 1 ? "Next Question" : "Finish"}
          </button>
        </div>
      </div>
    </div>
  );
}
