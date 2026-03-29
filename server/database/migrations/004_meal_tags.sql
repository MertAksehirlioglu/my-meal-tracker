-- Migration: Add tags column to meals table
-- Tags are stored as a comma-separated string and indexed for fast filtering.

ALTER TABLE public.meals
  ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT '';

-- Index for tag-based filtering (substring search on the tags column)
CREATE INDEX IF NOT EXISTS idx_meals_tags ON public.meals(tags)
  WHERE tags IS NOT NULL AND tags <> '';

COMMENT ON COLUMN public.meals.tags IS
  'Comma-separated meal tags, e.g. "#pre-workout,#cheat-day,#restaurant"';
