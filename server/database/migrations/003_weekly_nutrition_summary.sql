-- Migration: 003_weekly_nutrition_summary
-- Creates a view that pre-aggregates daily nutrition totals per user.
-- Used by GET /api/progress/weekly to avoid per-request JS aggregation.

CREATE OR REPLACE VIEW weekly_nutrition_summary AS
SELECT
  user_id,
  DATE_TRUNC('day', consumed_at AT TIME ZONE 'UTC') AS day,
  SUM(total_calories)::NUMERIC AS total_calories,
  SUM(total_protein)::NUMERIC  AS total_protein,
  SUM(total_carbs)::NUMERIC    AS total_carbs,
  SUM(total_fat)::NUMERIC      AS total_fat,
  COUNT(*)::INTEGER             AS meal_count
FROM meals
GROUP BY user_id, DATE_TRUNC('day', consumed_at AT TIME ZONE 'UTC');

-- RLS: restrict each row to the owning user
ALTER VIEW weekly_nutrition_summary OWNER TO authenticated;

COMMENT ON VIEW weekly_nutrition_summary IS
  'Pre-aggregated daily nutrition totals per user. Queried by /api/progress/weekly.';
