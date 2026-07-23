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

create table if not exists public.flash_offers (
  id uuid primary key default gen_random_uuid(), partner_id uuid not null,
  title text not null, activity_type text not null, starts_at timestamptz not null, expires_at timestamptz not null,
  original_price numeric(10,2) not null, dolcia_price numeric(10,2) not null,
  quantity_total integer not null check (quantity_total > 0), quantity_remaining integer not null check (quantity_remaining >= 0),
  latitude double precision not null, longitude double precision not null, booking_url text,
  reason text, status text not null default 'pending' check (status in ('draft','pending','approved','live','sold_out','expired','rejected')),
  created_at timestamptz not null default now(),
  check (dolcia_price < original_price), check (expires_at <= starts_at)
);
create index if not exists flash_offers_live_idx on public.flash_offers (status, expires_at, starts_at);
alter table public.flash_offers enable row level security;

create table if not exists public.broadcast_declarations (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid,
  event_key text not null,
  event_title text not null,
  starts_at timestamptz not null,
  venue_name text not null,
  address text not null,
  latitude double precision,
  longitude double precision,
  source_url text not null,
  evidence_text text,
  declared_by_venue boolean not null default false,
  ai_status text not null default 'pending' check (ai_status in ('pending','confirmed','probable','contradictory','rejected')),
  ai_confidence numeric(4,3) not null default 0,
  ai_reasons jsonb not null default '[]',
  human_status text not null default 'not_required' check (human_status in ('not_required','to_review','approved','rejected')),
  active boolean not null default true,
  checked_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists broadcast_event_date_idx on public.broadcast_declarations (event_key, starts_at, ai_status, active);
alter table public.broadcast_declarations enable row level security;

create table if not exists public.shared_programs (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null, title text not null,
  destination jsonb not null default '{}', starts_at timestamptz, ends_at timestamptz,
  version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.program_members (
  program_id uuid not null references public.shared_programs(id) on delete cascade, user_id uuid,
  display_name text not null, member_kind text not null check (member_kind in ('account','standard','child_profile')),
  role text not null check (role in ('organizer','co_organizer','participant','viewer')), permissions jsonb not null default '{}',
  joined_at timestamptz not null default now(), primary key (program_id, display_name)
);
create table if not exists public.program_changes (
  id uuid primary key default gen_random_uuid(), program_id uuid not null references public.shared_programs(id) on delete cascade,
  author_id uuid, change_type text not null, payload jsonb not null, status text not null default 'proposed',
  created_at timestamptz not null default now(), decided_at timestamptz
);
create table if not exists public.program_votes (
  change_id uuid not null references public.program_changes(id) on delete cascade, voter_id uuid not null,
  vote text not null check (vote in ('yes','maybe','no')), created_at timestamptz not null default now(), primary key(change_id,voter_id)
);
alter table public.shared_programs enable row level security;
alter table public.program_members enable row level security;
alter table public.program_changes enable row level security;
alter table public.program_votes enable row level security;
alter publication supabase_realtime add table public.shared_programs, public.program_members, public.program_changes, public.program_votes;

-- Espace partenaire privé : une organisation peut avoir plusieurs utilisateurs et établissements.
create table if not exists public.partner_organizations (
  id uuid primary key default gen_random_uuid(), legal_name text not null, siret text not null unique,
  activity_type text not null, territory text, status text not null default 'draft'
    check (status in ('draft','submitted','under_review','changes_requested','contract_ready','approved','suspended')),
  created_at timestamptz not null default now(), approved_at timestamptz
);
create table if not exists public.partner_members (
  organization_id uuid not null references public.partner_organizations(id) on delete cascade,
  user_id uuid not null, role text not null check (role in ('owner','manager','editor','viewer')),
  created_at timestamptz not null default now(), primary key (organization_id,user_id)
);
create table if not exists public.partner_contracts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.partner_organizations(id),
  version text not null, document_url text not null, status text not null default 'draft'
    check (status in ('draft','sent','viewed','signed','cancelled','expired')),
  signer_name text, signature_provider text, signature_reference text unique,
  sent_at timestamptz, signed_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.partner_establishments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.partner_organizations(id),
  name text not null, place_type text not null, address text not null, postal_code text, city text not null,
  latitude double precision, longitude double precision, phone text, website text,
  status text not null default 'pending' check (status in ('draft','pending','verified','rejected','suspended')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- Un programme regroupe plusieurs rendez-vous : festival jeunesse, saison culturelle,
-- programme de vacances ou série nationale. Chaque occurrence reste vérifiée séparément.
create table if not exists public.event_programs (
  id uuid primary key default gen_random_uuid(), organization_id uuid references public.partner_organizations(id),
  title text not null, description text, audience text[], territory text, starts_on date not null, ends_on date not null,
  image_url text, source_url text not null, source_name text not null, national_scope boolean not null default false,
  status text not null default 'pending' check (status in ('draft','pending','approved','rejected','archived')),
  checked_at timestamptz, created_at timestamptz not null default now(), check (ends_on >= starts_on)
);
alter table public.partner_events add column if not exists organization_id uuid references public.partner_organizations(id);
alter table public.partner_events add column if not exists establishment_id uuid references public.partner_establishments(id);
alter table public.partner_events add column if not exists program_id uuid references public.event_programs(id);
alter table public.partner_events add column if not exists updated_at timestamptz not null default now();
alter table public.partner_events add column if not exists checked_at timestamptz;
create index if not exists event_programs_dates_idx on public.event_programs (starts_on,ends_on,status);
create index if not exists partner_events_program_idx on public.partner_events (program_id,starts_at,status);
alter table public.partner_organizations enable row level security;
alter table public.partner_members enable row level security;
alter table public.partner_contracts enable row level security;
alter table public.partner_establishments enable row level security;
alter table public.event_programs enable row level security;

-- Notes communautaires Dolcia : avis courts et anonymes rattachés à un lieu réel.
-- Jamais un avis inventé par l'IA ; toujours écrit et partagé volontairement par une personne.
create table if not exists community_notes (
  id uuid primary key default gen_random_uuid(),
  item_id text not null,
  item_name text not null,
  note text not null,
  city text,
  created_at timestamptz not null default now()
);
create index if not exists community_notes_item_id_idx on community_notes(item_id);

-- Animations personnalisées soumises par un partenaire (mode facultatif, en plus
-- du moteur générique universel — jamais une obligation de validation par lieu).
create table if not exists partner_animations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references partner_organizations(id),
  establishment_id uuid references partner_establishments(id),
  establishment_name text not null,
  title text not null,
  seconds integer not null default 60,
  text text not null,
  venue_type text,
  created_at timestamptz not null default now()
);
create index if not exists partner_animations_establishment_idx on partner_animations(establishment_name);
