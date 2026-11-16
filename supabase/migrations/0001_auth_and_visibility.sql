-- Migration: add ownership + visibility to presets, and auth-aware RLS.
-- Run this in the Supabase SQL editor (idempotent — safe to re-run).
--
-- Before: anyone could read/insert any preset (public experiment).
-- After:  saving requires auth; presets are private by default and only the
--         owner (or a public flag) exposes them. Legacy ownerless rows are
--         migrated to public so the community library keeps showing them.

-- 1. Columns -----------------------------------------------------------------
alter table presets
  add column if not exists user_id uuid references auth.users (id) on delete set null;

alter table presets
  add column if not exists is_public boolean not null default false;

-- 2. Backfill legacy rows (no owner) as public community presets -------------
update presets set is_public = true where user_id is null;

-- 3. Indexes -----------------------------------------------------------------
create index if not exists presets_user_id_idx on presets (user_id);
create index if not exists presets_public_created_idx
  on presets (is_public, created_at desc);

-- 4. Replace permissive policies with auth-aware ones ------------------------
drop policy if exists "presets public read" on presets;
drop policy if exists "presets anon insert" on presets;
drop policy if exists "presets anon like" on presets;

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
