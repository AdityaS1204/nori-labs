-- Nori expression presets — run this in the Supabase SQL editor.
-- A "preset" bundles several named expression states, each a full robot-face
-- pose, stored as JSONB. No auth yet: anyone may read and insert (experiment).

create table if not exists presets (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  description    text not null default '',
  author_name    text not null,
  author_handle  text,
  states         jsonb not null,            -- ExpressionState[]: {id,label,face}
  cover_state_id text not null,
  accent         text not null default '#eaf3ff',
  category       text,
  likes          integer not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists presets_created_at_idx on presets (created_at desc);

alter table presets enable row level security;

-- Public experiment policies. Tighten these once auth is added
-- (e.g. insert: with check (auth.uid() is not null)).
create policy "presets public read"
  on presets for select using (true);

create policy "presets anon insert"
  on presets for insert with check (true);

-- Optional, only if you wire up a working like button:
-- create policy "presets anon like"
--   on presets for update using (true) with check (true);
