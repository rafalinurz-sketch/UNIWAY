/**
 * Public Supabase project settings. These are publishable client values, not
 * secrets; Row Level Security protects the data. Deployments may override
 * either value through NEXT_PUBLIC_* environment variables.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ummjmbqrnbqzxvfxptru.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_tmElsnpS5zjEuEQ42EDtSg_c4cjk4g9";
