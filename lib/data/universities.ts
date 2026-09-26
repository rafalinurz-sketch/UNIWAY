import type { University } from "@/lib/types";
import raw from "./universities.json";

/**
 * Ported directly from the working UNIWAY prototype (212 universities) —
 * same data, same "verify on official site" disclaimers, nothing re-guessed
 * in the conversion. This is static content bundled with the app (not a
 * Supabase table) because it doesn't change per-user and doesn't need a
 * database round-trip; see README for how to move it into Supabase later
 * if you want to edit it without redeploying.
 */
export const UNIVERSITIES = raw as unknown as University[];

export function getUniversity(id: string): University | undefined {
  return UNIVERSITIES.find((u) => u.id === id);
}

export function regionsList(): string[] {
  return Array.from(new Set(UNIVERSITIES.map((u) => u.region))).sort();
}

export function countriesList(): string[] {
  return Array.from(new Set(UNIVERSITIES.map((u) => u.country))).sort();
}
