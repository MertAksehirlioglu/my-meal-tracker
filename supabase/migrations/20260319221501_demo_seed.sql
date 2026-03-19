-- Seed demo data for MealSnap.
-- This migration is safe to run multiple times.
-- It seeds data only if an auth user exists for demo@mealsnap.app.

DO $$
DECLARE
  demo_user_id UUID;
BEGIN
  SELECT id
  INTO demo_user_id
  FROM auth.users
  WHERE email = 'demo@mealsnap.app'
  ORDER BY created_at ASC
  LIMIT 1;

  IF demo_user_id IS NULL THEN
    RAISE NOTICE 'Skipping demo seed: auth user demo@mealsnap.app not found.';
    RETURN;
  END IF;

  INSERT INTO public.users (
    id,
    email,
    name,
    height,
    weight,
    age,
    activity_level,
    goal,
    daily_calorie_target,
    created_at,
    updated_at
  )
  VALUES (
    demo_user_id,
    'demo@mealsnap.app',
    'Demo User',
    170,
    70,
    30,
    'moderate',
    'maintain',
    2000,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    height = EXCLUDED.height,
    weight = EXCLUDED.weight,
    age = EXCLUDED.age,
    activity_level = EXCLUDED.activity_level,
    goal = EXCLUDED.goal,
    daily_calorie_target = EXCLUDED.daily_calorie_target,
    updated_at = NOW();

  INSERT INTO public.user_goals (
    user_id,
    target_calories,
    target_protein,
    target_carbs,
    target_fat,
    start_date,
    is_active,
    created_at,
    updated_at
  )
  SELECT
    demo_user_id,
    2000,
    150,
    250,
    65,
    CURRENT_DATE,
    true,
    NOW(),
    NOW()
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.user_goals
    WHERE user_id = demo_user_id
      AND is_active = true
  );

  DELETE FROM public.meals
  WHERE user_id = demo_user_id
    AND consumed_at::date = CURRENT_DATE
    AND name IN (
      'Greek Yogurt with Berries',
      'Grilled Chicken Caesar Salad',
      'Apple with Almond Butter',
      'Salmon with Quinoa'
    );

  INSERT INTO public.meals (
    user_id,
    name,
    meal_type,
    consumed_at,
    total_calories,
    total_protein,
    total_carbs,
    total_fat,
    total_fiber,
    total_sugar,
    notes,
    created_at,
    updated_at
  ) VALUES
    (demo_user_id, 'Greek Yogurt with Berries', 'breakfast', (CURRENT_DATE + INTERVAL '8 hours')::timestamp, 220, 15, 30, 5, 4, 20, 'Greek yogurt topped with mixed berries and honey', NOW(), NOW()),
    (demo_user_id, 'Grilled Chicken Caesar Salad', 'lunch', (CURRENT_DATE + INTERVAL '12 hours')::timestamp, 450, 35, 25, 18, 8, 6, 'Grilled chicken breast over romaine with parmesan', NOW(), NOW()),
    (demo_user_id, 'Apple with Almond Butter', 'snack', (CURRENT_DATE + INTERVAL '15 hours')::timestamp, 180, 6, 25, 8, 5, 18, 'Medium apple with 1 tbsp almond butter', NOW(), NOW()),
    (demo_user_id, 'Salmon with Quinoa', 'dinner', (CURRENT_DATE + INTERVAL '19 hours')::timestamp, 520, 38, 45, 22, 6, 8, 'Baked salmon with quinoa and roasted vegetables', NOW(), NOW());

  INSERT INTO public.user_progress (
    user_id,
    date,
    total_calories,
    total_protein,
    total_carbs,
    total_fat,
    created_at
  )
  VALUES (
    demo_user_id,
    CURRENT_DATE,
    1370,
    94,
    125,
    53,
    NOW()
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    total_calories = EXCLUDED.total_calories,
    total_protein = EXCLUDED.total_protein,
    total_carbs = EXCLUDED.total_carbs,
    total_fat = EXCLUDED.total_fat,
    created_at = NOW();

  INSERT INTO public.food_database (
    name,
    calories_per_100g,
    protein_per_100g,
    carbs_per_100g,
    fat_per_100g,
    fiber_per_100g,
    sugar_per_100g,
    category,
    created_at,
    updated_at
  ) VALUES
    ('Greek Yogurt', 59, 10, 3.6, 0.4, 0, 3.6, 'Dairy', NOW(), NOW()),
    ('Blueberries', 57, 0.7, 14, 0.3, 2.4, 10, 'Fruit', NOW(), NOW()),
    ('Chicken Breast', 165, 31, 0, 3.6, 0, 0, 'Protein', NOW(), NOW()),
    ('Romaine Lettuce', 17, 1.2, 3.3, 0.3, 2.1, 1.2, 'Vegetable', NOW(), NOW()),
    ('Salmon', 208, 25, 0, 12, 0, 0, 'Seafood', NOW(), NOW()),
    ('Quinoa', 368, 14, 64, 6, 7, 0, 'Grain', NOW(), NOW()),
    ('Apple', 52, 0.3, 14, 0.2, 2.4, 10, 'Fruit', NOW(), NOW()),
    ('Almond Butter', 614, 21, 20, 56, 10, 5, 'Nut', NOW(), NOW())
  ON CONFLICT (name) DO NOTHING;

  RAISE NOTICE 'Demo seed migration completed for user %', demo_user_id;
END
$$;