-- Migration: RLS audit — add WITH CHECK constraints on all user-scoped tables.
--
-- Existing FOR ALL policies only have a USING clause, which covers SELECT/
-- UPDATE/DELETE row visibility but does NOT prevent a user from inserting or
-- updating a row with another user's user_id.  We replace every policy with
-- explicit per-operation policies that add WITH CHECK (auth.uid() = user_id)
-- on INSERT and UPDATE.

-- ─── public.users ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "users_own_data" ON public.users;

CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "users_delete" ON public.users
  FOR DELETE USING (auth.uid() = id);

-- ─── public.meals ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "meals_own_data" ON public.meals;

CREATE POLICY "meals_select" ON public.meals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "meals_insert" ON public.meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meals_update" ON public.meals
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meals_delete" ON public.meals
  FOR DELETE USING (auth.uid() = user_id);

-- ─── public.user_goals ───────────────────────────────────────────────────────

DROP POLICY IF EXISTS "user_goals_own_data" ON public.user_goals;

CREATE POLICY "user_goals_select" ON public.user_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_goals_insert" ON public.user_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_goals_update" ON public.user_goals
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_goals_delete" ON public.user_goals
  FOR DELETE USING (auth.uid() = user_id);

-- ─── public.user_progress ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "user_progress_own_data" ON public.user_progress;

CREATE POLICY "user_progress_select" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_progress_insert" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_update" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_delete" ON public.user_progress
  FOR DELETE USING (auth.uid() = user_id);

-- ─── public.meal_templates ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "meal_templates_own_data" ON public.meal_templates;

CREATE POLICY "meal_templates_select" ON public.meal_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "meal_templates_insert" ON public.meal_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meal_templates_update" ON public.meal_templates
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meal_templates_delete" ON public.meal_templates
  FOR DELETE USING (auth.uid() = user_id);

-- ─── public.meal_inventory ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "meal_inventory_own_data" ON public.meal_inventory;

CREATE POLICY "meal_inventory_select" ON public.meal_inventory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "meal_inventory_insert" ON public.meal_inventory
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meal_inventory_update" ON public.meal_inventory
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meal_inventory_delete" ON public.meal_inventory
  FOR DELETE USING (auth.uid() = user_id);

-- ─── public.meal_plan_slots ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "meal_plan_slots_own_data" ON public.meal_plan_slots;

CREATE POLICY "meal_plan_slots_select" ON public.meal_plan_slots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "meal_plan_slots_insert" ON public.meal_plan_slots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meal_plan_slots_update" ON public.meal_plan_slots
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meal_plan_slots_delete" ON public.meal_plan_slots
  FOR DELETE USING (auth.uid() = user_id);

-- ─── public.food_database ────────────────────────────────────────────────────
-- Public read-only; no user ownership column — no changes needed.
-- Confirm no INSERT/UPDATE/DELETE policies exist for non-admin users.

DO $$
BEGIN
  ASSERT (
    SELECT COUNT(*) FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename   = 'food_database'
      AND cmd IN ('INSERT', 'UPDATE', 'DELETE')
  ) = 0,
  'food_database has unexpected write policies — review manually';
END $$;
