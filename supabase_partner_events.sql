create table if not exists public.partner_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue_name text,
  address text,
  latitude double precision,
  longitude double precision,
  category text,
  price_label text,
  booking_url text,
  image_url text,
  partner_name text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  visibility text not null default 'public' check (visibility in ('public','private')),
  created_at timestamptz not null default now()
);

alter table public.partner_events enable row level security;

create index if not exists partner_events_date_idx on public.partner_events (starts_at);
create index if not exists partner_events_status_idx on public.partner_events (status, visibility);
