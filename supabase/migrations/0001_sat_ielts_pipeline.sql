-- ============================================================================
-- UNIWAY — Supabase migration for SAT/IELTS content pipeline
-- Run this in: Supabase Dashboard → SQL Editor → New query → paste → Run
-- Safe to re-run: every statement uses IF NOT EXISTS / OR REPLACE.
-- ============================================================================

-- Required for gen_random_uuid()
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- SAT
-- ----------------------------------------------------------------------------
create table if not exists sat_tests (
  id text primary key,
  title text not null,
  source_file text,
  source_path text,
  created_at timestamptz not null default now()
);

create table if not exists sat_questions (
  id text primary key,
  test_id text references sat_tests(id) on delete set null,
  section text not null check (section in ('math','rw')),
  topic text not null,
  difficulty text default 'Medium',
  question text not null,
  choices jsonb not null,              -- e.g. ["A text","B text","C text","D text"]
  correct_index int,                   -- nullable: null + needs_review=true if not confidently extracted
  explanation text,
  source_file text,
  source_path text,
  question_hash text,                  -- normalized hash of question+choices, used for de-duplication
  needs_review boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists sat_questions_hash_uidx on sat_questions(question_hash) where question_hash is not null;
create index if not exists sat_questions_test_idx on sat_questions(test_id);
create index if not exists sat_questions_topic_idx on sat_questions(topic);
create index if not exists sat_questions_review_idx on sat_questions(needs_review) where needs_review = true;

-- ----------------------------------------------------------------------------
-- IELTS — Reading
-- ----------------------------------------------------------------------------
create table if not exists ielts_reading_tests (
  id text primary key,
  title text not null,
  source_file text,
  source_path text,
  created_at timestamptz not null default now()
);
create table if not exists ielts_reading_passages (
  id text primary key,
  test_id text references ielts_reading_tests(id) on delete set null,
  title text not null,
  text text not null,
  source_file text,
  source_path text,
  needs_review boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists ielts_reading_questions (
  id text primary key,
  passage_id text not null references ielts_reading_passages(id) on delete cascade,
  type text not null,                  -- tfng | mcq | matching | gap ...
  question text not null,
  choices jsonb,
  answer text,                          -- stored as text; mcq uses index-as-string
  question_hash text,
  needs_review boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists ielts_reading_q_hash_uidx on ielts_reading_questions(question_hash) where question_hash is not null;
create index if not exists ielts_reading_q_passage_idx on ielts_reading_questions(passage_id);

-- ----------------------------------------------------------------------------
-- IELTS — Listening
-- ----------------------------------------------------------------------------
create table if not exists ielts_listening_tests (
  id text primary key,
  title text not null,
  audio_path text,                      -- path inside the "ielts" storage bucket
  source_file text,
  created_at timestamptz not null default now()
);
create table if not exists ielts_listening_questions (
  id text primary key,
  test_id text not null references ielts_listening_tests(id) on delete cascade,
  type text not null,                   -- gap | mcq | matching ...
  question text not null,
  choices jsonb,
  answer text,
  question_hash text,
  needs_review boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists ielts_listen_q_hash_uidx on ielts_listening_questions(question_hash) where question_hash is not null;

-- ----------------------------------------------------------------------------
-- IELTS — Writing & Speaking (prompts only — these are prompts, not MCQs)
-- ----------------------------------------------------------------------------
create table if not exists ielts_writing_tasks (
  id text primary key,
  task_type text not null check (task_type in ('task1','task2')),
  title text,
  prompt text not null,
  source_file text,
  needs_review boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists ielts_speaking_prompts (
  id text primary key,
  part text not null check (part in ('Part 1','Part 2','Part 3')),
  prompt text not null,
  source_file text,
  needs_review boolean not null default false,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Import pipeline tracking
-- ----------------------------------------------------------------------------
create table if not exists import_jobs (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,                 -- 'sat' | 'ielts'
  file_name text not null,
  file_path text not null,
  file_hash text,
  status text not null default 'queued' check (status in ('queued','processing','done','error')),
  questions_extracted int default 0,
  questions_imported int default 0,
  duplicates int default 0,
  errors int default 0,
  needs_review_count int default 0,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists import_jobs_filehash_uidx on import_jobs(file_hash) where file_hash is not null;
create index if not exists import_jobs_status_idx on import_jobs(status);

create table if not exists import_errors (
  id uuid primary key default gen_random_uuid(),
  import_job_id uuid references import_jobs(id) on delete cascade,
  file_name text,
  error_message text not null,
  created_at timestamptz not null default now()
);

create table if not exists question_review_queue (
  id uuid primary key default gen_random_uuid(),
  question_table text not null,         -- e.g. 'sat_questions', 'ielts_reading_questions'
  question_id text not null,
  reason text,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists review_queue_open_idx on question_review_queue(resolved) where resolved = false;

-- ----------------------------------------------------------------------------
-- User results (requires real Supabase Auth — see notes at bottom)
-- ----------------------------------------------------------------------------
create table if not exists user_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  test_id text,
  test_type text not null,              -- 'sat' | 'ielts_reading' | 'ielts_listening' ...
  score numeric,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists user_attempts_user_idx on user_attempts(user_id);

create table if not exists user_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references user_attempts(id) on delete cascade,
  question_table text not null,
  question_id text not null,
  selected_answer text,
  is_correct boolean,
  time_spent_seconds int,
  created_at timestamptz not null default now()
);
create index if not exists user_answers_attempt_idx on user_answers(attempt_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table sat_tests enable row level security;
alter table sat_questions enable row level security;
alter table ielts_reading_tests enable row level security;
alter table ielts_reading_passages enable row level security;
alter table ielts_reading_questions enable row level security;
alter table ielts_listening_tests enable row level security;
alter table ielts_listening_questions enable row level security;
alter table ielts_writing_tasks enable row level security;
alter table ielts_speaking_prompts enable row level security;
alter table import_jobs enable row level security;
alter table import_errors enable row level security;
alter table question_review_queue enable row level security;
alter table user_attempts enable row level security;
alter table user_answers enable row level security;

-- Public read on published question content (needed for Practice Tests to work with the anon/publishable key)
create policy if not exists "Public read sat_tests" on sat_tests for select using (true);
create policy if not exists "Public read sat_questions" on sat_questions for select using (needs_review = false);
create policy if not exists "Public read ielts_reading_tests" on ielts_reading_tests for select using (true);
create policy if not exists "Public read ielts_reading_passages" on ielts_reading_passages for select using (needs_review = false);
create policy if not exists "Public read ielts_reading_questions" on ielts_reading_questions for select using (needs_review = false);
create policy if not exists "Public read ielts_listening_tests" on ielts_listening_tests for select using (true);
create policy if not exists "Public read ielts_listening_questions" on ielts_listening_questions for select using (needs_review = false);
create policy if not exists "Public read ielts_writing_tasks" on ielts_writing_tasks for select using (needs_review = false);
create policy if not exists "Public read ielts_speaking_prompts" on ielts_speaking_prompts for select using (needs_review = false);

-- Client-driven import (CSV/JSON you upload yourself through the app's Admin page) —
-- these allow the publishable key to insert/update content tables directly.
-- TIGHTEN OR REMOVE these once you move fully to the Edge Function pipeline (service_role-only writes).
create policy if not exists "Client insert sat_tests" on sat_tests for insert with check (true);
create policy if not exists "Client insert sat_questions" on sat_questions for insert with check (true);
create policy if not exists "Client update sat_questions" on sat_questions for update using (true);
create policy if not exists "Client insert ielts_reading_tests" on ielts_reading_tests for insert with check (true);
create policy if not exists "Client insert ielts_reading_passages" on ielts_reading_passages for insert with check (true);
create policy if not exists "Client update ielts_reading_passages" on ielts_reading_passages for update using (true);
create policy if not exists "Client insert ielts_reading_questions" on ielts_reading_questions for insert with check (true);
create policy if not exists "Client update ielts_reading_questions" on ielts_reading_questions for update using (true);

-- Import tracking — readable by anyone (so the Admin page can show progress), written by client for now
create policy if not exists "Read import_jobs" on import_jobs for select using (true);
create policy if not exists "Insert import_jobs" on import_jobs for insert with check (true);
create policy if not exists "Update import_jobs" on import_jobs for update using (true);
create policy if not exists "Read import_errors" on import_errors for select using (true);
create policy if not exists "Insert import_errors" on import_errors for insert with check (true);
create policy if not exists "Read review_queue" on question_review_queue for select using (true);
create policy if not exists "Insert review_queue" on question_review_queue for insert with check (true);
create policy if not exists "Update review_queue" on question_review_queue for update using (true);

-- User results — strictly owner-only (requires real Supabase Auth, not a local mock login)
create policy if not exists "Users manage own attempts" on user_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "Users manage own answers" on user_answers
  for all using (
    exists (select 1 from user_attempts a where a.id = attempt_id and a.user_id = auth.uid())
  ) with check (
    exists (select 1 from user_attempts a where a.id = attempt_id and a.user_id = auth.uid())
  );

-- ============================================================================
-- STORAGE POLICIES for the existing "sat" and "ielts" buckets
-- Adjust to match how you want files read (these assume the buckets stay private
-- and only your own signed-in admin session, or your publishable key via signed
-- URLs, should read them — tighten further once you have real user roles).
-- ============================================================================
create policy if not exists "Read sat bucket" on storage.objects
  for select using (bucket_id = 'sat');
create policy if not exists "Read ielts bucket" on storage.objects
  for select using (bucket_id = 'ielts');

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. This migration does NOT include a service_role key or secrets — run it in
--    the SQL Editor, which uses your own dashboard session, not the anon key.
-- 2. user_attempts/user_answers only work once real Supabase Auth is wired in
--    (auth.uid() must resolve to a signed-in user) — a local/mock login will not
--    satisfy these policies.
-- 3. The "Client insert/update" policies on question tables exist so the app's
--    browser-side CSV/JSON importer can write directly with the publishable key.
--    If you deploy the Edge Function pipeline for PDFs, you can drop these and
--    restrict writes to service_role (called only from the Edge Function).
