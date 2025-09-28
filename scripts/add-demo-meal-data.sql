-- Additional Demo Meal Data for MealSnap
-- Run this script AFTER the initial setup-demo-user.sql has been executed
-- This adds more realistic meal data spanning 7 days

-- Replace this with your actual demo user ID from Supabase
DO $$
DECLARE
    demo_user_id UUID := '134c6174-8e84-4c0e-a95e-3b62e87c6324'; -- REPLACE WITH YOUR ACTUAL DEMO USER ID
BEGIN

-- Verify the demo user exists
IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = demo_user_id) THEN
    RAISE EXCEPTION 'Demo user with ID % does not exist. Please update the demo_user_id variable.', demo_user_id;
END IF;

-- Clear existing meal data for demo user (optional - remove if you want to keep existing data)
DELETE FROM meals WHERE user_id = demo_user_id;
DELETE FROM user_progress WHERE user_id = demo_user_id;

-- Add comprehensive meal data for 7 days
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

-- Add corresponding progress data for each day
INSERT INTO user_progress (
  user_id,
  date,
  total_calories,
  total_protein,
  total_carbs,
  total_fat,
  created_at
) VALUES
  (demo_user_id, CURRENT_DATE, 1370, 94, 125, 53, NOW()),
  (demo_user_id, CURRENT_DATE - INTERVAL '1 day', 1240, 78, 133, 52, NOW() - INTERVAL '1 day'),
  (demo_user_id, CURRENT_DATE - INTERVAL '2 days', 1560, 96, 149, 67, NOW() - INTERVAL '2 days'),
  (demo_user_id, CURRENT_DATE - INTERVAL '3 days', 1270, 81, 131, 52, NOW() - INTERVAL '3 days'),
  (demo_user_id, CURRENT_DATE - INTERVAL '4 days', 1380, 77, 156, 51, NOW() - INTERVAL '4 days'),
  (demo_user_id, CURRENT_DATE - INTERVAL '5 days', 1520, 86, 113, 80, NOW() - INTERVAL '5 days'),
  (demo_user_id, CURRENT_DATE - INTERVAL '6 days', 1550, 90, 139, 64, NOW() - INTERVAL '6 days')
ON CONFLICT (user_id, date) DO UPDATE SET
  total_calories = EXCLUDED.total_calories,
  total_protein = EXCLUDED.total_protein,
  total_carbs = EXCLUDED.total_carbs,
  total_fat = EXCLUDED.total_fat,
  created_at = EXCLUDED.created_at;

END $$;

-- Script completed successfully!
-- The demo user now has 7 days of comprehensive meal and progress data.