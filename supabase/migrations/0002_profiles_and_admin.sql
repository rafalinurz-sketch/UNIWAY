-- ============================================================================
-- UNIWAY — profiles, real Supabase Auth wiring, and admin role
-- Run after 0001_sat_ielts_pipeline.sql
-- ============================================================================

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  is_admin boolean not null default false,
  gpa text,
  sat text,
  ielts text,
  toefl text,
  intended_major text,
  target_countries text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy if not exists "Users read own profile" on profiles
  for select using (auth.uid() = id);
create policy if not exists "Users update own profile" on profiles
  for update using (auth.uid() = id);
-- Admins can read every profile (needed for /admin/users)
create policy if not exists "Admins read all profiles" on profiles
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Making the FIRST admin: run this once yourself, replacing the email —
-- there is no UI for bootstrapping the very first admin (chicken-and-egg
-- problem: only admins can grant admin). After that, use /admin/users, which
-- calls the set_admin() function below.
-- ----------------------------------------------------------------------------
-- update profiles set is_admin = true where id = (select id from auth.users where email = 'you@example.com');

-- Secure RPC so an existing admin can promote/demote another user WITHOUT the
-- browser ever touching a service_role key. security definer + the explicit
-- caller check inside the function is what makes this safe to call with the
-- publishable/anon key from the client.
create or replace function public.set_admin(target_user_id uuid, make_admin boolean)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin) then
    raise exception 'Only an admin can change admin status.';
  end if;
  update profiles set is_admin = make_admin where id = target_user_id;
end;
$$;
