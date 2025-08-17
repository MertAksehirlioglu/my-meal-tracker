-- STEP 2: Enable RLS and create policies
-- Run this AFTER step 1 completes successfully

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "users_own_data" ON public.users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "meals_own_data" ON public.meals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "food_database_public_read" ON public.food_database
  FOR SELECT USING (true);

CREATE POLICY "user_goals_own_data" ON public.user_goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "user_progress_own_data" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Create user profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();