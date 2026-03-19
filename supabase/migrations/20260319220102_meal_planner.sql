-- Meal Planner schema for MealSnap
-- Run this in your Supabase SQL editor after 001_initial_schema.sql

-- ─── Tables ────────────────────────────────────────────────────────────────

-- Reusable meal template definitions owned by each user
CREATE TABLE public.meal_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein NUMERIC(6,2) NOT NULL DEFAULT 0,
  carbs NUMERIC(6,2) NOT NULL DEFAULT 0,
  fat NUMERIC(6,2) NOT NULL DEFAULT 0,
  fiber NUMERIC(6,2) DEFAULT 0,
  sugar NUMERIC(6,2) DEFAULT 0,
  serving_size TEXT,
  notes TEXT,
  image_url TEXT,
  source_meal_id UUID REFERENCES public.meals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Week-scoped inventory: how many portions of a template the user has this week
CREATE TABLE public.meal_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.meal_templates(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,   -- Monday of the ISO week
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, template_id, week_start)
);

-- Calendar slot assignments: inventory portion placed on a specific day/meal-type
CREATE TABLE public.meal_plan_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  inventory_id UUID REFERENCES public.meal_inventory(id) ON DELETE CASCADE NOT NULL,
  planned_date DATE NOT NULL,
  meal_type meal_type NOT NULL,
  is_confirmed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Indexes ───────────────────────────────────────────────────────────────

CREATE INDEX idx_meal_templates_user_id ON public.meal_templates(user_id);
CREATE INDEX idx_meal_templates_user_name ON public.meal_templates(user_id, name);

CREATE INDEX idx_meal_inventory_user_week ON public.meal_inventory(user_id, week_start);
CREATE INDEX idx_meal_inventory_template ON public.meal_inventory(template_id);

CREATE INDEX idx_meal_plan_slots_user_date ON public.meal_plan_slots(user_id, planned_date);
CREATE INDEX idx_meal_plan_slots_inventory ON public.meal_plan_slots(inventory_id);

-- ─── Row Level Security ────────────────────────────────────────────────────

ALTER TABLE public.meal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meal_templates_own_data" ON public.meal_templates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "meal_inventory_own_data" ON public.meal_inventory
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "meal_plan_slots_own_data" ON public.meal_plan_slots
  FOR ALL USING (auth.uid() = user_id);

-- ─── updated_at triggers ───────────────────────────────────────────────────
-- Reuses public.update_updated_at_column() created in 001_initial_schema.sql

CREATE TRIGGER update_meal_templates_updated_at
  BEFORE UPDATE ON public.meal_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_inventory_updated_at
  BEFORE UPDATE ON public.meal_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_plan_slots_updated_at
  BEFORE UPDATE ON public.meal_plan_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
