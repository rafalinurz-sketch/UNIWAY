-- ============================================================================
-- UNIWAY — per-user app data: application tracker, study plans, essays
-- Run after 0001 and 0002. All owner-only via RLS (auth.uid() = user_id).
-- ============================================================================

create table if not exists application_tracker (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  university_id text not null,           -- matches lib/data/universities.ts id
  status text not null default 'Not Started'
    check (status in ('Not Started','In Progress','Ready','Submitted','Decision Received')),
  checklist jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, university_id)
);
alter table application_tracker enable row level security;
create policy if not exists "Owner manages application_tracker" on application_tracker
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_university text,
  target_major text,
  target_sat text,
  target_ielts text,
  application_year text,
  deadlines jsonb default '[]'::jsonb,
  generated_plan jsonb,                  -- {phases:[{title, items:[...]}]}
  updated_at timestamptz not null default now()
);
alter table study_plans enable row level security;
create policy if not exists "Owner manages study_plans" on study_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists essays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled essay',
  prompt text,
  body text default '',
  word_count int default 0,
  feedback jsonb,                        -- last AI/rule-based feedback, if any
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table essays enable row level security;
create policy if not exists "Owner manages essays" on essays
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
