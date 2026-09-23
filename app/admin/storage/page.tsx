"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const BUCKETS = ["sat", "ielts", "files"] as const;
type Bucket = (typeof BUCKETS)[number];

export default function AdminStoragePage() {
  const [bucket, setBucket] = useState<Bucket>("sat");
  const [files, setFiles] = useState<{ name: string; metadata?: { size?: number } | null }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const supabase = createClient();

  async function load() {
    setError(null);
    setFiles(null);
    const { data, error } = await supabase.storage.from(bucket).list("", { limit: 200 });
    if (error) setError(error.message);
    else setFiles((data ?? []).filter((f) => !f.name.startsWith(".")));
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket]);

  async function upload(file: File) {
    setProgress(0);
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      setProgress(null);
      setError("Sign in as an admin to upload to this bucket.");
      return;
    }
    const path = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucket}/${encodeURIComponent(path)}`;
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("apikey", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
      xhr.setRequestHeader("Authorization", `Bearer ${authData.session.access_token}`);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round((100 * e.loaded) / e.total));
      xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error("Upload failed (" + xhr.status + ")")));
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(file);
    })
      .then(load)
      .catch((e) => setError(e.message))
      .finally(() => setProgress(null));
  }

  async function openFile(name: string) {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(name, 120);
    if (error) return setError(error.message);
    window.open(data.signedUrl, "_blank");
  }
  async function deleteFile(name: string) {
    if (!window.confirm(`Delete ${name}?`)) return;
    const { error } = await supabase.storage.from(bucket).remove([name]);
    if (error) setError(error.message);
    else load();
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-extrabold">Storage</h1>
      <div className="mt-4 flex gap-2">
        {BUCKETS.map((b) => (
          <button key={b} onClick={() => setBucket(b)} className={`pill ${bucket === b ? "bg-accent text-white" : ""}`}>
            {b}
          </button>
        ))}
      </div>

      <div className="card mt-5">
        <label className="text-xs font-bold text-ink-soft">Upload to &quot;{bucket}&quot;</label>
        <input type="file" className="mt-2" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        {progress !== null && (
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
          </div>
        )}
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      <div className="card mt-5">
        {files === null && <p className="text-sm text-ink-soft">Loading…</p>}
        {files !== null && files.length === 0 && <p className="text-sm text-ink-soft">No files found in this bucket.</p>}
        {(files ?? []).map((f) => (
          <div key={f.name} className="card-flat mb-2 flex items-center justify-between">
            <div>
              <b className="text-sm">{f.name}</b>
              {f.metadata?.size && <p className="text-xs text-ink-soft">{Math.round(f.metadata.size / 1024)} KB</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => openFile(f.name)} className="pill">Open</button>
              <button onClick={() => deleteFile(f.name)} className="pill">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
