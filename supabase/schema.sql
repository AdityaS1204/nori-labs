-- Nori expression presets — run this in the Supabase SQL editor.
-- A "preset" bundles several named expression states, each a full robot-face
-- pose, stored as JSONB. Presets are owned (auth.users) and private by default;
-- `is_public` opts a preset into the community library.

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
  user_id        uuid references auth.users (id) on delete set null,
  is_public      boolean not null default false,
  render         jsonb not null              -- RenderConfig: {target,durationMs,ease}
                 default '{"target":"web","durationMs":220,"ease":"easeInOut"}'::jsonb,
  created_at     timestamptz not null default now()
);

-- For an existing table created before auth, see
-- supabase/migrations/0001_auth_and_visibility.sql (adds the two columns), then
-- supabase/migrations/0002_render_target.sql (adds `render`).

create index if not exists presets_created_at_idx on presets (created_at desc);
create index if not exists presets_user_id_idx on presets (user_id);
create index if not exists presets_public_created_idx
  on presets (is_public, created_at desc);

alter table presets enable row level security;

-- Read: anyone sees public presets; you also see your own (private included).
create policy "presets read public or own"
  on presets for select
  using (is_public = true or user_id = auth.uid());

-- Insert: must be signed in, and the row's owner must be you (not spoofable).
create policy "presets insert own"
  on presets for insert
  with check (auth.uid() = user_id);

-- Update / delete: owner only.
create policy "presets update own"
  on presets for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "presets delete own"
  on presets for delete
  using (user_id = auth.uid());
