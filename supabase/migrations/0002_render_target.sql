-- Migration: record which face engine a preset was posed for.
-- Run this in the Supabase SQL editor (idempotent — safe to re-run).
--
-- The playground previews in Chromium, but Nori's firmware draws the face with
-- LVGL, which cannot render the glow, a pasted SVG, or a spring morph. A preset
-- now carries its target plus the tween settings LVGL needs, so an exported
-- pack tells the firmware which parameters to trust.
--
-- One jsonb column rather than three scalars: the shape is `RenderConfig` in
-- lib/render-target.ts, and later motion settings land here without a further
-- migration.

alter table presets
  add column if not exists render jsonb not null
  default '{"target":"web","durationMs":220,"ease":"easeInOut"}'::jsonb;

-- Existing rows were all authored against the web preview, and the column
-- default already says so. `normalizeRender` also treats a null or malformed
-- value as the web target, so a row written before this migration still opens.
