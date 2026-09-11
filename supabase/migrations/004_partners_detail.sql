-- 004: partner detail columns (used by the public partner detail view)
alter table partners
  add column if not exists category text,
  add column if not exists partner_since int,
  add column if not exists description text,
  add column if not exists focus_areas text[],
  add column if not exists contact_name text,
  add column if not exists contact_email text;

-- Keep the partners table world-readable for the public directory.
-- (RLS already allows public read; this just guarantees SELECT without auth errors.)
grant select on partners to anon;
