-- 003: speaker + category for programme sessions (needed by the public programme design)
alter table programme_sessions
  add column if not exists speaker text,
  add column if not exists category text;

-- Plenary | Breakout | Workshop | Social (null = break/logistics item)
alter table programme_sessions
  drop constraint if exists programme_sessions_category_check;
alter table programme_sessions
  add constraint programme_sessions_category_check
  check (category is null or category in ('Plenary', 'Breakout', 'Workshop', 'Social'));