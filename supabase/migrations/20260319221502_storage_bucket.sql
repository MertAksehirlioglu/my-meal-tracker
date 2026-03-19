-- Storage setup for MealSnap meal images.
-- Creates the bucket and policies in an idempotent way.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'meal-images',
  'meal-images',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'meal_images_select_own'
  ) THEN
    CREATE POLICY meal_images_select_own
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'meal-images'
        AND owner = auth.uid()
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'meal_images_insert_own'
  ) THEN
    CREATE POLICY meal_images_insert_own
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'meal-images'
        AND owner = auth.uid()
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'meal_images_update_own'
  ) THEN
    CREATE POLICY meal_images_update_own
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'meal-images'
        AND owner = auth.uid()
      )
      WITH CHECK (
        bucket_id = 'meal-images'
        AND owner = auth.uid()
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'meal_images_delete_own'
  ) THEN
    CREATE POLICY meal_images_delete_own
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'meal-images'
        AND owner = auth.uid()
      );
  END IF;
END
$$;