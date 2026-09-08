create table attendees (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  organization text not null,
  role text,
  email text not null,
  phone text,
  dietary_needs text,
  accessibility_needs text,
  travel_needs text,
  consent_given boolean not null default false,
  qr_token uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now()
);

create table admins (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table check_ins (
  id uuid primary key default gen_random_uuid(),
  attendee_id uuid not null references attendees(id) on delete cascade,
  event_day date not null,
  checked_in_at timestamptz not null default now(),
  checked_in_by uuid references admins(id),
  unique (attendee_id, event_day)
);

create table programme_sessions (
  id uuid primary key default gen_random_uuid(),
  event_day date not null,
  start_time time not null,
  end_time time,
  title text not null,
  location text,
  description text,
  sort_order int default 0
);

create table documentation_posts (
  id uuid primary key default gen_random_uuid(),
  event_day date not null,
  notes text,
  photo_urls text[] default '{}',
  created_at timestamptz not null default now()
);

create table partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website_url text,
  parent_partner_id uuid references partners(id),
  sort_order int default 0
);