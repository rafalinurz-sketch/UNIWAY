"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthArea({ compact = false }: { compact?: boolean }) {
  const [name, setName] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setName(data.user.email?.split("@")[0] ?? "U");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setName(session?.user?.email?.split("@")[0] ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    setName(null);
    router.push("/");
    router.refresh();
  }

  if (name) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white"
        >
          {name.slice(0, 1).toUpperCase()}
        </Link>
        <button onClick={logout} className={`pill ${compact ? "px-2.5 py-2 text-[11px]" : ""}`}>
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className={`btn-outline text-sm ${compact ? "px-2.5 py-2 text-xs" : "px-4 py-2"}`}>
        Sign In
      </Link>
      <Link href="/signup" className={`btn-primary text-sm ${compact ? "px-2.5 py-2 text-xs" : "px-4 py-2"}`}>
        Sign Up
      </Link>
    </div>
  );
}
