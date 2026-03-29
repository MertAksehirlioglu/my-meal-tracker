-- Returns aggregated nutrition totals for a user within a time range.
-- Used by GET /api/progress/today to eliminate JS-side reduce.
CREATE OR REPLACE FUNCTION get_today_nutrition(
  p_user_id uuid,
  p_start   timestamptz,
  p_end     timestamptz
)
RETURNS TABLE (
  total_calories numeric,
  total_protein  numeric,
  total_carbs    numeric,
  total_fat      numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    COALESCE(SUM(total_calories), 0) AS total_calories,
    COALESCE(SUM(total_protein),  0) AS total_protein,
    COALESCE(SUM(total_carbs),    0) AS total_carbs,
    COALESCE(SUM(total_fat),      0) AS total_fat
  FROM meals
  WHERE user_id    = p_user_id
    AND consumed_at >= p_start
    AND consumed_at <= p_end;
$$;

-- Returns per-day aggregated nutrition for a user within a time range.
-- Used by GET /api/progress/weekly to eliminate JS-side grouping loop.
CREATE OR REPLACE FUNCTION get_weekly_nutrition(
  p_user_id uuid,
  p_start   timestamptz,
  p_end     timestamptz
)
RETURNS TABLE (
  date           date,
  total_calories numeric,
  total_protein  numeric,
  total_carbs    numeric,
  total_fat      numeric,
  meal_count     bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    (consumed_at AT TIME ZONE 'UTC')::date AS date,
    SUM(total_calories)                    AS total_calories,
    SUM(total_protein)                     AS total_protein,
    SUM(total_carbs)                       AS total_carbs,
    SUM(total_fat)                         AS total_fat,
    COUNT(*)                               AS meal_count
  FROM meals
  WHERE user_id    = p_user_id
    AND consumed_at >= p_start
    AND consumed_at <= p_end
  GROUP BY (consumed_at AT TIME ZONE 'UTC')::date
  ORDER BY date;
$$;
