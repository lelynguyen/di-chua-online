-- Đi Chùa Online — schema Supabase (áp dụng khi bật Supabase Auth, Giai đoạn 4)
-- Nguyên tắc: mỗi người chỉ đọc/ghi dữ liệu của chính mình. Lời nguyện mặc định riêng tư.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Khách tham quan',
  avatar_color text not null default '#c9972f',
  created_at timestamptz not null default now()
);

create table if not exists public.meditation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  spot_id text not null,
  planned_minutes integer not null,
  actual_seconds integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  quality text not null default 'medium',
  volumes jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.meditation_sessions enable row level security;
alter table public.user_settings enable row level security;

create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own sessions" on public.meditation_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own settings" on public.user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
