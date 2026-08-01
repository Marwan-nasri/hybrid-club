-- ============================================================
-- HYBRID CLUB — Schéma Supabase v1
-- Référence du schéma déjà exécuté dans Supabase (région EU)
-- ============================================================

-- ---------- PROFILES ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  member_number int unique,
  first_name text,
  sex text check (sex in ('femme','homme')),
  birth_year int check (birth_year between 1930 and 2012),
  height_cm int check (height_cm between 120 and 230),
  weight_kg numeric(5,1) check (weight_kg between 35 and 250),
  goal text check (goal in ('fessiers','tonification','recomposition','masse','force','seche')),
  level text check (level in ('debutant','intermediaire','avance')),
  equipment text check (equipment in ('salle','maison_halteres','poids_du_corps')),
  days_per_week int check (days_per_week between 2 and 6),
  diet text check (diet in ('aucun','vegetarien','sans_porc','sans_lactose','halal')) default 'aucun',
  disliked_foods text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-création du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Attribution automatique du numéro de membre
create sequence public.member_number_seq start 1;

create or replace function public.assign_member_number()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.onboarding_completed = true and old.onboarding_completed = false then
    new.member_number := nextval('public.member_number_seq');
  end if;
  return new;
end;
$$;

create trigger on_onboarding_completed
  before update on public.profiles
  for each row execute function public.assign_member_number();

-- ---------- PROGRAMS ----------
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  version int not null default 1,
  status text not null default 'active' check (status in ('active','archived')),
  program_json jsonb not null,
  nutrition_json jsonb not null,
  generated_at timestamptz default now(),
  valid_until date,
  unique (user_id, version)
);

create unique index one_active_program_per_user
  on public.programs (user_id) where (status = 'active');

-- ---------- WORKOUT LOGS ----------
create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  session_key text not null,
  completed_at timestamptz default now(),
  exercises_json jsonb not null
);

create index workout_logs_user_idx on public.workout_logs (user_id, completed_at desc);

-- ---------- SUBSCRIPTIONS ----------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text check (plan in ('fondateur','mensuel','annuel')),
  status text not null default 'incomplete'
    check (status in ('active','trialing','past_due','canceled','incomplete')),
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- WAITLIST ----------
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text default 'snapchat',
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.workout_logs enable row level security;
alter table public.subscriptions enable row level security;
alter table public.waitlist enable row level security;

create policy "own profile read"  on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

create policy "own programs read" on public.programs for select using (auth.uid() = user_id);

create policy "own logs read"   on public.workout_logs for select using (auth.uid() = user_id);
create policy "own logs insert" on public.workout_logs for insert with check (auth.uid() = user_id);

create policy "own subscription read" on public.subscriptions for select using (auth.uid() = user_id);

create policy "waitlist public insert" on public.waitlist for insert with check (true);

-- ============================================================
-- updated_at automatique
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_profiles before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger touch_subscriptions before update on public.subscriptions
  for each row execute function public.touch_updated_at();