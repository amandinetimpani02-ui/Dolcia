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
alter table public.partner_events add column if not exists sponsored_until timestamptz;
alter table public.partner_events add column if not exists sponsorship_tier text;

create table if not exists public.service_offers (
  id uuid primary key default gen_random_uuid(), partner_id uuid not null,
  service_type text not null check (service_type in ('babysitting','driver','concierge','home','shopping','booking')),
  title text not null, description text, price_label text, latitude double precision, longitude double precision,
  verified boolean not null default false, active boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, service_offer_id uuid references public.service_offers(id),
  requested_for timestamptz not null, address text not null, details text, status text not null default 'requested',
  created_at timestamptz not null default now()
);
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, endpoint text not null unique,
  consent_types text[] not null default '{}', created_at timestamptz not null default now(), revoked_at timestamptz
);
alter table public.service_offers enable row level security;
alter table public.service_requests enable row level security;
alter table public.push_subscriptions enable row level security;

create table if not exists public.partner_applications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, legal_name text not null,
  service_types text[] not null default '{}', company_number text, insurance_document_url text,
  identity_document_url text, background_check_status text,
  status text not null default 'submitted' check (status in ('draft','submitted','under_review','changes_requested','approved','rejected','suspended')),
  submitted_at timestamptz default now(), reviewed_at timestamptz, reviewed_by uuid, review_note text
);
create table if not exists public.provider_reviews (
  id uuid primary key default gen_random_uuid(), request_id uuid not null references public.service_requests(id),
  provider_id uuid not null, customer_id uuid not null, rating smallint not null check (rating between 1 and 5),
  comment text, safety_flag boolean not null default false, created_at timestamptz not null default now(),
  unique(request_id, customer_id)
);
create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(), application_id uuid references public.partner_applications(id),
  provider_id uuid, moderator_id uuid not null, action text not null, note text, created_at timestamptz not null default now()
);
create table if not exists public.notifications_outbox (
  id uuid primary key default gen_random_uuid(), recipient_id uuid not null, notification_type text not null,
  title text not null, body text not null, payload jsonb not null default '{}', status text not null default 'pending',
  created_at timestamptz not null default now(), sent_at timestamptz
);
alter table public.partner_applications enable row level security;
alter table public.provider_reviews enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.notifications_outbox enable row level security;
