alter table attendees enable row level security;
alter table admins enable row level security;
alter table check_ins enable row level security;
alter table programme_sessions enable row level security;
alter table documentation_posts enable row level security;
alter table partners enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean as $$
  select exists (select 1 from admins where id = auth.uid());
$$ language sql security definer stable;

-- Attendees: admin-only. No public policy = no public access at all.
create policy "Admins can view attendees"
  on attendees for select using (is_admin());
create policy "Admins can update attendees"
  on attendees for update using (is_admin());
-- Registration itself goes through a server-side API route using the
-- service_role key, not a direct client insert — that comes next.

-- Check-ins: admin only, both read and write
create policy "Admins manage check-ins"
  on check_ins for all using (is_admin());

-- Programme + partners + docs: public can read, only admins can write
create policy "Public can view programme"
  on programme_sessions for select using (true);
create policy "Admins manage programme"
  on programme_sessions for all using (is_admin());

create policy "Public can view partners"
  on partners for select using (true);
create policy "Admins manage partners"
  on partners for all using (is_admin());

create policy "Public can view docs"
  on documentation_posts for select using (true);
create policy "Admins manage docs"
  on documentation_posts for all using (is_admin());

-- Admins table: visible only to other admins
create policy "Admins can view admin list"
  on admins for select using (is_admin());