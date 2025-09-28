-- Demo User Setup Script for MealSnap
-- This script should be run in Supabase SQL Editor to set up the demo user
-- Run this after your initial database migration

-- IMPORTANT: First create the auth user in Supabase Dashboard:
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Click "Add User" and enter:
--    Email: demo@mealsnap.app
--    Password: demo123456
--    Auto Confirm User: ✅
-- 3. Copy the generated user ID and replace the value below

-- Set the demo user ID here (REPLACE WITH ACTUAL USER ID FROM SUPABASE)
DO $$
DECLARE
    demo_user_id UUID := '134c6174-8e84-4c0e-a95e-3b62e87c6324'; -- REPLACE THIS WITH ACTUAL USER ID
BEGIN

-- Verify the user exists in auth.users
IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = demo_user_id) THEN
    RAISE EXCEPTION 'Demo user with ID % does not exist in auth.users. Please create the user first in Supabase Dashboard.', demo_user_id;
END IF;

-- 2. Create demo user profile
INSERT INTO users (
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
) VALUES (
  demo_user_id,
  'demo@mealsnap.app',
  'Demo User',
  170, -- cm
  70,  -- kg
  30,  -- years
  'moderate',
  'maintain',
  2000, -- calories
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  height = EXCLUDED.height,
  weight = EXCLUDED.weight,
  age = EXCLUDED.age,
  activity_level = EXCLUDED.activity_level,
  goal = EXCLUDED.goal,
  daily_calorie_target = EXCLUDED.daily_calorie_target,
  updated_at = NOW();

-- 3. Create demo user goals
INSERT INTO user_goals (
  user_id,
  target_calories,
  target_protein,
  target_carbs,
  target_fat,
  start_date,
  is_active,
  created_at,
  updated_at
) VALUES (
  demo_user_id,
  2000,
  150,  -- grams
  250,  -- grams
  65,   -- grams
  CURRENT_DATE,
  true,
  NOW(),
  NOW()
);

-- 4. Create sample meals for demo user (7 days of data)
INSERT INTO meals (
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
  -- TODAY (Current Date)
  (demo_user_id, 'Greek Yogurt with Berries', 'breakfast', (CURRENT_DATE + INTERVAL '8 hours')::timestamp, 220, 15, 30, 5, 4, 20, 'Greek yogurt topped with mixed berries and honey', NOW(), NOW()),
  (demo_user_id, 'Grilled Chicken Caesar Salad', 'lunch', (CURRENT_DATE + INTERVAL '12 hours')::timestamp, 450, 35, 25, 18, 8, 6, 'Grilled chicken breast over romaine with parmesan', NOW(), NOW()),
  (demo_user_id, 'Apple with Almond Butter', 'snack', (CURRENT_DATE + INTERVAL '15 hours')::timestamp, 180, 6, 25, 8, 5, 18, 'Medium apple with 1 tbsp almond butter', NOW(), NOW()),
  (demo_user_id, 'Salmon with Quinoa', 'dinner', (CURRENT_DATE + INTERVAL '19 hours')::timestamp, 520, 38, 45, 22, 6, 8, 'Baked salmon with quinoa and roasted vegetables', NOW(), NOW()),

  -- YESTERDAY (-1 day)
  (demo_user_id, 'Overnight Oats', 'breakfast', (CURRENT_DATE - INTERVAL '1 day' + INTERVAL '7:30 hours')::timestamp, 280, 12, 48, 8, 6, 15, 'Oats with banana, chia seeds, and almond milk', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  (demo_user_id, 'Turkey Sandwich', 'lunch', (CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12:30 hours')::timestamp, 380, 28, 42, 12, 4, 8, 'Whole grain bread with turkey, avocado, and veggies', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  (demo_user_id, 'Mixed Nuts', 'snack', (CURRENT_DATE - INTERVAL '1 day' + INTERVAL '15:30 hours')::timestamp, 160, 6, 8, 14, 3, 2, 'Handful of almonds, walnuts, and cashews', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  (demo_user_id, 'Chicken Stir Fry', 'dinner', (CURRENT_DATE - INTERVAL '1 day' + INTERVAL '19:30 hours')::timestamp, 420, 32, 35, 18, 5, 12, 'Chicken with mixed vegetables over brown rice', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  -- DAY -2
  (demo_user_id, 'Scrambled Eggs & Toast', 'breakfast', (CURRENT_DATE - INTERVAL '2 days' + INTERVAL '8 hours')::timestamp, 320, 18, 28, 16, 3, 4, 'Two eggs with whole grain toast and avocado', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (demo_user_id, 'Quinoa Buddha Bowl', 'lunch', (CURRENT_DATE - INTERVAL '2 days' + INTERVAL '13 hours')::timestamp, 480, 18, 65, 18, 8, 10, 'Quinoa with chickpeas, vegetables, and tahini dressing', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (demo_user_id, 'Protein Smoothie', 'snack', (CURRENT_DATE - INTERVAL '2 days' + INTERVAL '16 hours')::timestamp, 220, 25, 18, 6, 4, 14, 'Protein powder with banana and spinach', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (demo_user_id, 'Beef Tacos', 'dinner', (CURRENT_DATE - INTERVAL '2 days' + INTERVAL '19 hours')::timestamp, 540, 35, 38, 25, 6, 5, 'Lean beef tacos with corn tortillas and salsa', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

  -- DAY -3
  (demo_user_id, 'Smoothie Bowl', 'breakfast', (CURRENT_DATE - INTERVAL '3 days' + INTERVAL '8:30 hours')::timestamp, 300, 8, 55, 10, 8, 35, 'Acai bowl with granola, banana, and berries', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  (demo_user_id, 'Tuna Salad Wrap', 'lunch', (CURRENT_DATE - INTERVAL '3 days' + INTERVAL '12 hours')::timestamp, 350, 25, 35, 12, 5, 4, 'Tuna salad in whole wheat wrap with vegetables', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  (demo_user_id, 'Hummus & Veggies', 'snack', (CURRENT_DATE - INTERVAL '3 days' + INTERVAL '15 hours')::timestamp, 140, 6, 16, 8, 4, 6, 'Hummus with carrot sticks and bell peppers', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  (demo_user_id, 'Grilled Salmon', 'dinner', (CURRENT_DATE - INTERVAL '3 days' + INTERVAL '18:30 hours')::timestamp, 480, 42, 25, 22, 4, 5, 'Grilled salmon with sweet potato and asparagus', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

  -- DAY -4
  (demo_user_id, 'Avocado Toast', 'breakfast', (CURRENT_DATE - INTERVAL '4 days' + INTERVAL '7:45 hours')::timestamp, 280, 8, 32, 16, 8, 2, 'Sourdough toast with mashed avocado and tomato', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  (demo_user_id, 'Chicken & Rice Bowl', 'lunch', (CURRENT_DATE - INTERVAL '4 days' + INTERVAL '13:30 hours')::timestamp, 520, 38, 48, 18, 3, 6, 'Grilled chicken with jasmine rice and steamed broccoli', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  (demo_user_id, 'Greek Yogurt', 'snack', (CURRENT_DATE - INTERVAL '4 days' + INTERVAL '16:30 hours')::timestamp, 120, 15, 8, 3, 0, 8, 'Plain Greek yogurt with a drizzle of honey', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  (demo_user_id, 'Vegetarian Pasta', 'dinner', (CURRENT_DATE - INTERVAL '4 days' + INTERVAL '19:15 hours')::timestamp, 460, 16, 68, 14, 6, 8, 'Whole wheat pasta with marinara and vegetables', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

  -- DAY -5
  (demo_user_id, 'Protein Pancakes', 'breakfast', (CURRENT_DATE - INTERVAL '5 days' + INTERVAL '8:15 hours')::timestamp, 340, 22, 35, 12, 4, 12, 'Protein pancakes with banana and maple syrup', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  (demo_user_id, 'Mediterranean Salad', 'lunch', (CURRENT_DATE - INTERVAL '5 days' + INTERVAL '12:45 hours')::timestamp, 420, 14, 28, 28, 6, 8, 'Mixed greens with feta, olives, and olive oil dressing', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  (demo_user_id, 'Trail Mix', 'snack', (CURRENT_DATE - INTERVAL '5 days' + INTERVAL '15:45 hours')::timestamp, 180, 5, 18, 12, 3, 10, 'Mixed nuts, seeds, and dried fruit', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  (demo_user_id, 'Pork Chop Dinner', 'dinner', (CURRENT_DATE - INTERVAL '5 days' + INTERVAL '18:45 hours')::timestamp, 580, 45, 32, 28, 4, 6, 'Lean pork chop with mashed potatoes and green beans', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

  -- DAY -6
  (demo_user_id, 'Breakfast Burrito', 'breakfast', (CURRENT_DATE - INTERVAL '6 days' + INTERVAL '8 hours')::timestamp, 380, 20, 35, 18, 4, 3, 'Eggs, cheese, and salsa in whole wheat tortilla', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  (demo_user_id, 'Sushi Bowl', 'lunch', (CURRENT_DATE - INTERVAL '6 days' + INTERVAL '13:15 hours')::timestamp, 450, 22, 58, 12, 2, 8, 'Salmon sashimi over sushi rice with vegetables', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  (demo_user_id, 'Cheese & Crackers', 'snack', (CURRENT_DATE - INTERVAL '6 days' + INTERVAL '16 hours')::timestamp, 200, 8, 18, 12, 2, 2, 'Whole grain crackers with aged cheddar', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  (demo_user_id, 'BBQ Chicken', 'dinner', (CURRENT_DATE - INTERVAL '6 days' + INTERVAL '19:30 hours')::timestamp, 520, 40, 28, 22, 3, 15, 'BBQ chicken breast with corn and coleslaw', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days');

-- 5. Create today's progress summary for demo user
INSERT INTO user_progress (
  user_id,
  date,
  total_calories,
  total_protein,
  total_carbs,
  total_fat,
  created_at
) VALUES (
  demo_user_id,
  CURRENT_DATE,
  1370, -- Sum of meals above
  94,   -- Sum of protein
  125,  -- Sum of carbs
  53,   -- Sum of fat
  NOW()
) ON CONFLICT (user_id, date) DO UPDATE SET
  total_calories = EXCLUDED.total_calories,
  total_protein = EXCLUDED.total_protein,
  total_carbs = EXCLUDED.total_carbs,
  total_fat = EXCLUDED.total_fat,
  created_at = NOW();

-- 6. Add some sample food database entries (public for all users)
INSERT INTO food_database (
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

END $$;

-- Script completed successfully!
-- The demo user profile and sample data have been created.