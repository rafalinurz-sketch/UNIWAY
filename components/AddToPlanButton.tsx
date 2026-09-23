"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AddToPlanButton({ universityId }: { universityId: string }) {
  const [state, setState] = useState<"idle" | "added" | "loading" | "signedout" | "error">("idle");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setState("signedout");
        return;
      }
      const { data: row } = await supabase
        .from("application_tracker")
        .select("id")
        .eq("user_id", data.user.id)
        .eq("university_id", universityId)
        .maybeSingle();
      if (row) setState("added");
    });
  }, [supabase, universityId]);

  async function add() {
    setState("loading");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setState("signedout");
      return;
    }
    const { error } = await supabase
      .from("application_tracker")
      .insert({ user_id: userData.user.id, university_id: universityId, status: "Not Started" });
    setState(error ? "error" : "added");
  }

  if (state === "signedout") {
    return (
      <a href="/login" className="btn-outline text-white border-white/20 text-sm px-4 py-2">
        Sign in to save
      </a>
    );
  }
  return (
    <button onClick={add} disabled={state === "added" || state === "loading"} className="btn-primary text-sm px-4 py-2">
      {state === "added" ? "Added to plan ✓" : state === "loading" ? "Adding…" : "Add to My Plan"}
    </button>
  );
}
