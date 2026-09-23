"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase/client";

type BucketFile = { name: string; bucket: "sat" | "ielts" };

function classify(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "csv") return { ext, kind: "csv", auto: true };
  if (ext === "json") return { ext, kind: "json", auto: true };
  return { ext, kind: "other", auto: false };
}

export default function AdminImportPage() {
  const [files, setFiles] = useState<BucketFile[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const [{ data: sat }, { data: ielts }] = await Promise.all([
        supabase.storage.from("sat").list("", { limit: 200 }),
        supabase.storage.from("ielts").list("", { limit: 200 }),
      ]);
      setFiles([
        ...(sat ?? []).filter((f) => !f.name.startsWith(".")).map((f) => ({ name: f.name, bucket: "sat" as const })),
        ...(ielts ?? []).filter((f) => !f.name.startsWith(".")).map((f) => ({ name: f.name, bucket: "ielts" as const })),
      ]);
    })();
  }, [supabase]);

  function appendLog(line: string) {
    setLog((l) => [line, ...l]);
  }

  async function importBucketFile(f: BucketFile) {
    const info = classify(f.name);
    if (!info.auto) {
      appendLog(`⚠ ${f.name}: not auto-importable (${info.ext || "unknown"} format). Queue it for server-side processing or convert to CSV/JSON.`);
      await supabase.from("import_jobs").insert({ bucket: f.bucket, file_name: f.name, file_path: f.name, status: "queued" });
      return;
    }
    const { data: signed, error: signErr } = await supabase.storage.from(f.bucket).createSignedUrl(f.name, 120);
    if (signErr || !signed) {
      appendLog(`✗ ${f.name}: could not create signed URL — ${signErr?.message}`);
      return;
    }
    const res = await fetch(signed.signedUrl);
    if (!res.ok) {
      appendLog(`✗ ${f.name}: download failed (${res.status})`);
      return;
    }
    const text = await res.text();
    await importText(text, info.kind as "csv" | "json", f.bucket, f.name);
  }

  async function importText(text: string, kind: "csv" | "json", bucket: "sat" | "ielts", sourceFile: string) {
    try {
      if (bucket === "sat") {
        const rows = kind === "csv" ? parseCsvSat(text) : parseJsonSat(text);
        const withSource = rows.map((r) => ({ ...r, source_file: sourceFile }));
        const { error } = await supabase.from("sat_questions").upsert(withSource, { onConflict: "id" });
        if (error) throw error;
        appendLog(`✓ ${sourceFile}: imported ${rows.length} SAT question(s).`);
      } else {
        const rows = kind === "csv" ? parseCsvIelts(text) : parseJsonIelts(text);
        for (const r of rows) {
          const { error } = await supabase
            .from("ielts_reading_passages")
            .upsert({ id: r.id, title: r.title, text: r.text, source_file: sourceFile }, { onConflict: "id" });
          if (error) throw error;
          if (r.questions?.length) {
            const qRows = r.questions.map((q: any, i: number) => ({
              id: `${r.id}-q${i}`,
              passage_id: r.id,
              type: q.type,
              question: q.q,
              choices: q.choices ?? null,
              answer: q.ans != null ? String(q.ans) : null,
            }));
            const { error: qErr } = await supabase.from("ielts_reading_questions").upsert(qRows, { onConflict: "id" });
            if (qErr) throw qErr;
          }
        }
        appendLog(`✓ ${sourceFile}: imported ${rows.length} IELTS passage(s).`);
      }
    } catch (e) {
      appendLog(`✗ ${sourceFile}: import failed — ${(e as Error).message}. Nothing was written for this file.`);
    }
  }

  async function onLocalFile(e: React.ChangeEvent<HTMLInputElement>, bucket: "sat" | "ielts") {
    const file = e.target.files?.[0];
    if (!file) return;
    const info = classify(file.name);
    if (!info.auto) {
      appendLog(`✗ ${file.name}: only .csv/.json can be parsed in the browser. Download a template below and convert it.`);
      return;
    }
    const text = await file.text();
    await importText(text, info.kind as "csv" | "json", bucket, file.name);
    e.target.value = "";
  }

  function downloadTemplate(kind: "sat-csv" | "sat-json" | "ielts-csv" | "ielts-json") {
    const templates: Record<string, string> = {
      "sat-csv":
        'id,test_id,test_title,section,topic,difficulty,question,choice_a,choice_b,choice_c,choice_d,correct_index,explanation\nsat-001,test-1,"My Set",math,Algebra,Medium,"If 2x+3=9, what is x?",1,2,3,4,2,"Subtract 3 then divide by 2."\n',
      "sat-json": JSON.stringify(
        [{ id: "sat-001", section: "math", topic: "Algebra", difficulty: "Medium", question: "If 2x+3=9, what is x?", choices: ["1", "2", "3", "4"], correct_index: 2, explanation: "Subtract 3 then divide by 2." }],
        null,
        2
      ),
      "ielts-csv":
        'passage_id,passage_title,passage_text,q_type,question,choice_a,choice_b,choice_c,choice_d,answer\np1,"My Passage","Full text...",tfng,"The passage says X.",,,,,True\n',
      "ielts-json": JSON.stringify(
        [{ id: "p1", title: "My Passage", text: "Full text...", questions: [{ type: "tfng", q: "The passage says X.", ans: "True" }] }],
        null,
        2
      ),
    };
    const blob = new Blob([templates[kind]], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = kind.replace("-", "_") + (kind.endsWith("csv") ? ".csv" : ".json");
    a.click();
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-extrabold">Import CSV/JSON</h1>
      <p className="mt-2 text-sm text-ink-soft">Only structured CSV/JSON is parsed here — nothing is guessed from PDFs in the browser.</p>

      <div className="card mt-5">
        <h3 className="font-bold">Files in your buckets</h3>
        <div className="mt-3 space-y-2">
          {files.length === 0 && <p className="text-sm text-ink-soft">No files found in either bucket.</p>}
          {files.map((f) => {
            const info = classify(f.name);
            return (
              <div key={f.bucket + f.name} className="card-flat flex items-center justify-between gap-3">
                <div>
                  <b className="text-sm">{f.name}</b>
                  <p className="text-xs text-ink-soft">
                    {f.bucket} · {info.auto ? "Auto-importable" : "Needs Edge Function"}
                  </p>
                </div>
                <button onClick={() => importBucketFile(f)} className="pill">
                  {info.auto ? "Import" : "Queue"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h3 className="font-bold">Upload SAT file</h3>
          <input type="file" accept=".csv,.json" className="mt-2" onChange={(e) => onLocalFile(e, "sat")} />
          <div className="mt-2 flex gap-2">
            <button className="pill" onClick={() => downloadTemplate("sat-csv")}>CSV template</button>
            <button className="pill" onClick={() => downloadTemplate("sat-json")}>JSON template</button>
          </div>
        </div>
        <div className="card">
          <h3 className="font-bold">Upload IELTS file</h3>
          <input type="file" accept=".csv,.json" className="mt-2" onChange={(e) => onLocalFile(e, "ielts")} />
          <div className="mt-2 flex gap-2">
            <button className="pill" onClick={() => downloadTemplate("ielts-csv")}>CSV template</button>
            <button className="pill" onClick={() => downloadTemplate("ielts-json")}>JSON template</button>
          </div>
        </div>
      </div>

      <div className="card mt-5">
        <h3 className="font-bold">Log</h3>
        <div className="mt-2 max-h-64 space-y-1 overflow-y-auto text-xs">
          {log.length === 0 && <p className="text-ink-soft">Nothing imported yet.</p>}
          {log.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function parseCsvSat(text: string) {
  const res = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });
  if (res.errors.length) throw new Error("CSV parse error: " + res.errors[0].message);
  const required = ["id", "section", "topic", "question", "choice_a", "choice_b", "choice_c", "choice_d", "correct_index"];
  const cols = res.meta.fields ?? [];
  const missing = required.filter((c) => !cols.includes(c));
  if (missing.length) throw new Error("Missing column(s): " + missing.join(", "));
  return (res.data as any[]).map((row) => ({
    id: row.id,
    test_id: row.test_id || null,
    test_title: row.test_title || null,
    section: row.section,
    topic: row.topic,
    difficulty: row.difficulty || "Medium",
    question: row.question,
    choices: [row.choice_a, row.choice_b, row.choice_c, row.choice_d],
    correct_index: parseInt(row.correct_index),
    explanation: row.explanation || null,
    needs_review: false,
  }));
}
function parseJsonSat(text: string) {
  const arr = JSON.parse(text);
  const list = Array.isArray(arr) ? arr : [arr];
  return list.map((row: any) => ({ ...row, needs_review: row.needs_review ?? false }));
}
function parseCsvIelts(text: string) {
  const res = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });
  if (res.errors.length) throw new Error("CSV parse error: " + res.errors[0].message);
  const byPassage: Record<string, any> = {};
  (res.data as any[]).forEach((row) => {
    if (!byPassage[row.passage_id]) byPassage[row.passage_id] = { id: row.passage_id, title: row.passage_title, text: row.passage_text, questions: [] };
    const q: any = { type: row.q_type, q: row.question };
    if (row.q_type === "mcq") {
      q.choices = [row.choice_a, row.choice_b, row.choice_c, row.choice_d].filter(Boolean);
      q.ans = parseInt(row.answer);
    } else {
      q.ans = row.answer;
    }
    byPassage[row.passage_id].questions.push(q);
  });
  return Object.values(byPassage);
}
function parseJsonIelts(text: string) {
  const arr = JSON.parse(text);
  return Array.isArray(arr) ? arr : [arr];
}
