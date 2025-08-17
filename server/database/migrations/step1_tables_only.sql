-- STEP 1: Create tables only
-- Run this first to test basic table creation

-- Create custom types
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
CREATE TYPE activity_level AS ENUM ('sedentary', 'light', 'moderate', 'active', 'very_active');
CREATE TYPE goal_type AS ENUM ('lose', 'maintain', 'gain');

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  height NUMERIC(5,2),
  weight NUMERIC(5,2),
  age INTEGER,
  activity_level activity_level DEFAULT 'moderate',
  goal goal_type DEFAULT 'maintain',
  daily_calorie_target INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meals table
CREATE TABLE public.meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  meal_type meal_type NOT NULL,
  consumed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  image_url TEXT,
  notes TEXT,
  total_calories INTEGER NOT NULL DEFAULT 0,
  total_protein NUMERIC(6,2) NOT NULL DEFAULT 0,
  total_carbs NUMERIC(6,2) NOT NULL DEFAULT 0,
  total_fat NUMERIC(6,2) NOT NULL DEFAULT 0,
  total_fiber NUMERIC(6,2) DEFAULT 0,
  total_sugar NUMERIC(6,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create food_database table
CREATE TABLE public.food_database (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  calories_per_100g INTEGER NOT NULL,
  protein_per_100g NUMERIC(6,2) NOT NULL,
  carbs_per_100g NUMERIC(6,2) NOT NULL,
  fat_per_100g NUMERIC(6,2) NOT NULL,
  fiber_per_100g NUMERIC(6,2) DEFAULT 0,
  sugar_per_100g NUMERIC(6,2) DEFAULT 0,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_goals table
CREATE TABLE public.user_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  target_weight NUMERIC(5,2),
  target_calories INTEGER,
  target_protein NUMERIC(6,2),
  target_carbs NUMERIC(6,2),
  target_fat NUMERIC(6,2),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_progress table
CREATE TABLE public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  weight NUMERIC(5,2),
  total_calories INTEGER NOT NULL DEFAULT 0,
  total_protein NUMERIC(6,2) NOT NULL DEFAULT 0,
  total_carbs NUMERIC(6,2) NOT NULL DEFAULT 0,
  total_fat NUMERIC(6,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Insert some sample food data
INSERT INTO public.food_database (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, category) VALUES
('Chicken Breast', 165, 31, 0, 3.6, 0, 0, 'protein'),
('Salmon', 208, 25, 0, 12, 0, 0, 'protein'),
('Brown Rice', 111, 2.6, 23, 0.9, 1.8, 0.4, 'grains'),
('Broccoli', 34, 2.8, 7, 0.4, 2.6, 1.5, 'vegetables'),
('Banana', 89, 1.1, 23, 0.3, 2.6, 12, 'fruits');