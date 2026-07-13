-- Tatami — Supabase schema.
-- Run this ONCE in your Supabase project: Dashboard → SQL Editor → paste → Run.
-- It creates the tables, locks them down with Row-Level Security so every
-- owner only ever sees their own data, and stamps each new row with its owner.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  business_name text,
  default_rate_cents integer not null default 0,
  currency text not null default 'USD',
  timezone text not null default 'UTC',
  created_at timestamptz not null default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  belt text not null default 'White',
  stripes integer not null default 0 check (stripes between 0 and 4),
  email text,
  phone text,
  start_date date,
  notes text,
  default_rate_cents integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  student_id uuid not null references students (id) on delete cascade,
  starts_at timestamptz not null,
  duration_minutes integer not null default 60,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  techniques text,
  notes text,
  location text,
  rate_cents integer,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  student_id uuid not null references students (id) on delete cascade,
  paid_on date not null default current_date,
  amount_cents integer not null default 0,
  method text not null default 'cash'
    check (method in ('cash', 'venmo', 'zelle', 'other')),
  lessons_covered integer not null default 0,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  student_id uuid not null references students (id) on delete cascade,
  promoted_on date not null default current_date,
  belt text not null,
  stripes integer not null default 0,
  note text
);

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text,
  belt_level text,
  sort integer not null default 0
);

create table if not exists student_skills (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  student_id uuid not null references students (id) on delete cascade,
  skill_id uuid not null references skills (id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started', 'drilling', 'proficient')),
  updated_at timestamptz not null default now(),
  unique (student_id, skill_id)
);

-- Helpful indexes
create index if not exists idx_students_owner on students (owner_id);
create index if not exists idx_lessons_owner_start on lessons (owner_id, starts_at);
create index if not exists idx_lessons_student on lessons (student_id);
create index if not exists idx_payments_student on payments (student_id);
create index if not exists idx_promotions_student on promotions (student_id);
create index if not exists idx_student_skills_student on student_skills (student_id);

-- ---------------------------------------------------------------------------
-- Stamp owner_id = the signed-in user on every insert (client can't spoof it)
-- ---------------------------------------------------------------------------
create or replace function public.set_owner_id()
returns trigger language plpgsql as $$
begin
  new.owner_id := auth.uid();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['students','lessons','payments','promotions','skills','student_skills']
  loop
    execute format('drop trigger if exists trg_set_owner on %I;', t);
    execute format(
      'create trigger trg_set_owner before insert on %I
         for each row execute function public.set_owner_id();', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Row-Level Security: deny by default, allow owners their own rows only
-- ---------------------------------------------------------------------------
alter table profiles       enable row level security;
alter table students       enable row level security;
alter table lessons        enable row level security;
alter table payments       enable row level security;
alter table promotions     enable row level security;
alter table skills         enable row level security;
alter table student_skills enable row level security;

-- profiles keyed by the user's own id
drop policy if exists profiles_owner on profiles;
create policy profiles_owner on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- every other table keyed by owner_id
do $$
declare t text;
begin
  foreach t in array array['students','lessons','payments','promotions','skills','student_skills']
  loop
    execute format('drop policy if exists %I_owner on %I;', t, t);
    execute format(
      'create policy %I_owner on %I
         for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());',
      t, t);
  end loop;
end $$;
