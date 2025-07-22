-- Initial database schema for MealSnap
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

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
  height NUMERIC(5,2), -- in cm
  weight NUMERIC(5,2), -- in kg
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

-- Create food_items table
CREATE TABLE public.food_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity NUMERIC(8,2) NOT NULL,
  unit TEXT NOT NULL, -- 'g', 'oz', 'cup', 'piece', etc.
  calories INTEGER NOT NULL,
  protein NUMERIC(6,2) NOT NULL,
  carbs NUMERIC(6,2) NOT NULL,
  fat NUMERIC(6,2) NOT NULL,
  fiber NUMERIC(6,2) DEFAULT 0,
  sugar NUMERIC(6,2) DEFAULT 0,
  confidence NUMERIC(3,2), -- from AI classification (0-1)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create food_database table (public reference data)
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

-- Create indexes for better performance
CREATE INDEX idx_meals_user_id ON public.meals(user_id);
CREATE INDEX idx_meals_consumed_at ON public.meals(consumed_at);
CREATE INDEX idx_meals_user_consumed ON public.meals(user_id, consumed_at);
CREATE INDEX idx_food_items_meal_id ON public.food_items(meal_id);
CREATE INDEX idx_food_database_name ON public.food_database(name);
CREATE INDEX idx_food_database_category ON public.food_database(category);
CREATE INDEX idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX idx_user_goals_active ON public.user_goals(user_id, is_active);
CREATE INDEX idx_user_progress_user_date ON public.user_progress(user_id, date);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can only access their own data
CREATE POLICY "users_own_data" ON public.users
  FOR ALL USING (auth.uid() = id);

-- Meals: users can only access their own meals
CREATE POLICY "meals_own_data" ON public.meals
  FOR ALL USING (auth.uid() = user_id);

-- Food items: users can only access food items from their own meals
CREATE POLICY "food_items_own_data" ON public.food_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.meals 
      WHERE meals.id = food_items.meal_id 
      AND meals.user_id = auth.uid()
    )
  );

-- Food database: public read access for all users
CREATE POLICY "food_database_public_read" ON public.food_database
  FOR SELECT USING (true);

-- Only admins can modify food database
CREATE POLICY "food_database_admin_write" ON public.food_database
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM public.users WHERE email = 'admin@mealsnap.com'
  ));

-- User goals: users can only access their own goals
CREATE POLICY "user_goals_own_data" ON public.user_goals
  FOR ALL USING (auth.uid() = user_id);

-- User progress: users can only access their own progress
CREATE POLICY "user_progress_own_data" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meals_updated_at
  BEFORE UPDATE ON public.meals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_food_database_updated_at
  BEFORE UPDATE ON public.food_database
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample food data
INSERT INTO public.food_database (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, category) VALUES
('Chicken Breast', 165, 31, 0, 3.6, 0, 0, 'protein'),
('Salmon', 208, 25, 0, 12, 0, 0, 'protein'),
('Brown Rice', 111, 2.6, 23, 0.9, 1.8, 0.4, 'grains'),
('Broccoli', 34, 2.8, 7, 0.4, 2.6, 1.5, 'vegetables'),
('Banana', 89, 1.1, 23, 0.3, 2.6, 12, 'fruits'),
('Greek Yogurt', 59, 10, 3.6, 0.4, 0, 3.2, 'dairy'),
('Eggs', 155, 13, 1.1, 11, 0, 1.1, 'protein'),
('Sweet Potato', 86, 1.6, 20, 0.1, 3, 4.2, 'vegetables'),
('Quinoa', 120, 4.4, 22, 1.9, 2.8, 0.9, 'grains'),
('Spinach', 23, 2.9, 3.6, 0.4, 2.2, 0.4, 'vegetables'); 