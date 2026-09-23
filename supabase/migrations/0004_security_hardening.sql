-- UNIWAY security hardening.
-- Run after migrations 0001–0003. This replaces the earlier permissive
-- browser-write policies with admin-only content management and makes the
-- profile role flag server-controlled. No application data is deleted.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Keep the role flag out of user-controlled profile updates. Admin changes
-- still go through the checked set_admin() RPC below.
create or replace function public.protect_profile_admin_flag()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin and not public.is_admin() then
    raise exception 'Only an admin can change admin status.';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_admin_flag on public.profiles;
create trigger protect_profile_admin_flag
  before update on public.profiles
  for each row execute function public.protect_profile_admin_flag();

drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Admins read all profiles" on public.profiles
  for select to authenticated using (public.is_admin());

create or replace function public.set_admin(target_user_id uuid, make_admin boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can change admin status.';
  end if;
  update public.profiles set is_admin = make_admin where id = target_user_id;
end;
$$;
revoke all on function public.set_admin(uuid, boolean) from public;
grant execute on function public.set_admin(uuid, boolean) to authenticated;

-- Remove the previous anon/authenticated content-write policies.
drop policy if exists "Client insert sat_tests" on public.sat_tests;
drop policy if exists "Client insert sat_questions" on public.sat_questions;
drop policy if exists "Client update sat_questions" on public.sat_questions;
drop policy if exists "Client insert ielts_reading_tests" on public.ielts_reading_tests;
drop policy if exists "Client insert ielts_reading_passages" on public.ielts_reading_passages;
drop policy if exists "Client update ielts_reading_passages" on public.ielts_reading_passages;
drop policy if exists "Client insert ielts_reading_questions" on public.ielts_reading_questions;
drop policy if exists "Client update ielts_reading_questions" on public.ielts_reading_questions;
drop policy if exists "Read import_jobs" on public.import_jobs;
drop policy if exists "Insert import_jobs" on public.import_jobs;
drop policy if exists "Update import_jobs" on public.import_jobs;
drop policy if exists "Read import_errors" on public.import_errors;
drop policy if exists "Insert import_errors" on public.import_errors;
drop policy if exists "Read review_queue" on public.question_review_queue;
drop policy if exists "Insert review_queue" on public.question_review_queue;
drop policy if exists "Update review_queue" on public.question_review_queue;
drop policy if exists "Admins manage sat_tests" on public.sat_tests;
drop policy if exists "Admins manage sat_questions" on public.sat_questions;
drop policy if exists "Admins manage ielts_reading_tests" on public.ielts_reading_tests;
drop policy if exists "Admins manage ielts_reading_passages" on public.ielts_reading_passages;
drop policy if exists "Admins manage ielts_reading_questions" on public.ielts_reading_questions;
drop policy if exists "Admins manage import_jobs" on public.import_jobs;
drop policy if exists "Admins manage import_errors" on public.import_errors;
drop policy if exists "Admins manage question_review_queue" on public.question_review_queue;
drop policy if exists "Admins read unreviewed sat_questions" on public.sat_questions;
drop policy if exists "Admins read unreviewed ielts_reading_passages" on public.ielts_reading_passages;
drop policy if exists "Admins read unreviewed ielts_reading_questions" on public.ielts_reading_questions;

create policy "Admins manage sat_tests" on public.sat_tests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage sat_questions" on public.sat_questions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage ielts_reading_tests" on public.ielts_reading_tests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage ielts_reading_passages" on public.ielts_reading_passages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage ielts_reading_questions" on public.ielts_reading_questions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage import_jobs" on public.import_jobs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage import_errors" on public.import_errors
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage question_review_queue" on public.question_review_queue
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Admins can inspect records waiting for review; public read policies for
-- reviewed SAT/IELTS content remain in place.
create policy "Admins read unreviewed sat_questions" on public.sat_questions
  for select to authenticated using (public.is_admin());
create policy "Admins read unreviewed ielts_reading_passages" on public.ielts_reading_passages
  for select to authenticated using (public.is_admin());
create policy "Admins read unreviewed ielts_reading_questions" on public.ielts_reading_questions
  for select to authenticated using (public.is_admin());

-- Bucket objects are private to admins. App users read published practice
-- content from database tables, not directly from the import buckets.
update storage.buckets set public = false where id in ('sat', 'ielts');
drop policy if exists "Read sat bucket" on storage.objects;
drop policy if exists "Read ielts bucket" on storage.objects;
drop policy if exists "Admins manage sat storage" on storage.objects;
drop policy if exists "Admins manage ielts storage" on storage.objects;
create policy "Admins manage sat storage" on storage.objects
  for all to authenticated using (bucket_id = 'sat' and public.is_admin())
  with check (bucket_id = 'sat' and public.is_admin());
create policy "Admins manage ielts storage" on storage.objects
  for all to authenticated using (bucket_id = 'ielts' and public.is_admin())
  with check (bucket_id = 'ielts' and public.is_admin());
