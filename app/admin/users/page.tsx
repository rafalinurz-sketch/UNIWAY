"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function load() {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setProfiles(data as Profile[]);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleAdmin(id: string, makeAdmin: boolean) {
    const { error } = await supabase.rpc("set_admin", { target_user_id: id, make_admin: makeAdmin });
    if (error) setError(error.message);
    else load();
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-extrabold">Users</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Uses the <code>set_admin()</code> Postgres function (security definer) — no service_role key touches the browser.
      </p>
      {error && <p className="card-flat mt-4 bg-red-500/10 text-sm text-red-400">{error}</p>}
      <div className="mt-5 space-y-2">
        {profiles === null && <p className="text-ink-soft">Loading…</p>}
        {(profiles ?? []).map((p) => (
          <div key={p.id} className="card-flat flex items-center justify-between">
            <div>
              <b className="text-sm">{p.name ?? "(no name)"}</b>
              <p className="text-xs text-ink-soft">{p.id}</p>
            </div>
            <div className="flex items-center gap-2">
              {p.is_admin && <span className="pill">Admin</span>}
              <button onClick={() => toggleAdmin(p.id, !p.is_admin)} className="pill">
                {p.is_admin ? "Revoke admin" : "Make admin"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
