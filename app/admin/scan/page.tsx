"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type FileInfo = { name: string; metadata?: { size?: number } | null };

export default function AdminScanPage() {
  const [connOk, setConnOk] = useState<boolean | null>(null);
  const [connError, setConnError] = useState<string | null>(null);
  const [satFiles, setSatFiles] = useState<FileInfo[] | null>(null);
  const [ieltsFiles, setIeltsFiles] = useState<FileInfo[] | null>(null);
  const [satCount, setSatCount] = useState<number | null>(null);
  const [ieltsCount, setIeltsCount] = useState<number | null>(null);
  const [satBucketErr, setSatBucketErr] = useState<string | null>(null);
  const [ieltsBucketErr, setIeltsBucketErr] = useState<string | null>(null);
  const supabase = createClient();

  async function scan() {
    setConnOk(null);
    setConnError(null);
    setSatFiles(null);
    setIeltsFiles(null);
    setSatBucketErr(null);
    setIeltsBucketErr(null);

    const { count: satC, error: satCErr } = await supabase.from("sat_questions").select("*", { count: "exact", head: true });
    const { count: ieltsC, error: ieltsCErr } = await supabase
      .from("ielts_reading_passages")
      .select("*", { count: "exact", head: true });
    if (satCErr || ieltsCErr) {
      setConnOk(false);
      setConnError((satCErr ?? ieltsCErr)?.message ?? "Unknown error");
    } else {
      setConnOk(true);
      setSatCount(satC ?? 0);
      setIeltsCount(ieltsC ?? 0);
    }

    const { data: sf, error: sfErr } = await supabase.storage.from("sat").list("", { limit: 200 });
    if (sfErr) setSatBucketErr(sfErr.message);
    else setSatFiles((sf ?? []).filter((f) => !f.name.startsWith(".")));

    const { data: ief, error: ieErr } = await supabase.storage.from("ielts").list("", { limit: 200 });
    if (ieErr) setIeltsBucketErr(ieErr.message);
    else setIeltsFiles((ief ?? []).filter((f) => !f.name.startsWith(".")));
  }

  useEffect(() => {
    scan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Scan &amp; Status</h1>
        <button onClick={scan} className="pill">
          Rescan
        </button>
      </div>

      <div className="card mt-5">
        <h3 className="font-bold">Connection status</h3>
        <p className="mt-2 text-sm">
          {connOk === null ? (
            "Checking…"
          ) : connOk ? (
            <span className="pill" style={{ background: "rgba(34,197,94,.15)", color: "#4ade80" }}>
              Connected: YES
            </span>
          ) : (
            <span className="pill" style={{ background: "rgba(239,68,68,.15)", color: "#f87171" }}>
              Connected: NO — {connError}
            </span>
          )}
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <BucketCard title="sat bucket" files={satFiles} error={satBucketErr} />
        <BucketCard title="ielts bucket" files={ieltsFiles} error={ieltsBucketErr} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="card-flat">
          <div className="text-xs font-bold text-ink-soft">SAT questions in Database</div>
          <div className="mt-1 text-2xl font-extrabold">{satCount ?? "—"}</div>
        </div>
        <div className="card-flat">
          <div className="text-xs font-bold text-ink-soft">IELTS passages in Database</div>
          <div className="mt-1 text-2xl font-extrabold">{ieltsCount ?? "—"}</div>
        </div>
      </div>
      <p className="mt-4 text-xs text-ink-soft">These are live query results from this browser session — refresh after uploading or importing.</p>
    </section>
  );
}

function BucketCard({ title, files, error }: { title: string; files: FileInfo[] | null; error: string | null }) {
  return (
    <div className="card">
      <h3 className="font-bold">{title}</h3>
      {error && <p className="mt-2 text-sm text-red-400">Error: {error}</p>}
      {!error && files === null && <p className="mt-2 text-sm text-ink-soft">Loading…</p>}
      {!error && files !== null && files.length === 0 && <p className="mt-2 text-sm text-ink-soft">No files found in this bucket.</p>}
      {!error && files !== null && files.length > 0 && (
        <>
          <p className="mt-2 text-sm font-semibold">{files.length} file(s)</p>
          <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs text-ink-soft">
            {files.map((f) => (
              <li key={f.name}>
                {f.name} {f.metadata?.size ? `(${Math.round(f.metadata.size / 1024)} KB)` : ""}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
