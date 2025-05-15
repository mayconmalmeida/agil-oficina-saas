
-- Add logo_url column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN logo_url TEXT;
  END IF;
END $$;

-- Create storage bucket for logos if doesn't exist
DO $$
BEGIN
  -- This will create the logos bucket if it doesn't exist yet
  -- The function will return NULL if the bucket already exists
  PERFORM storage.create_bucket('logos', {'public': true});
EXCEPTION
  WHEN OTHERS THEN
    -- Handle any errors
    RAISE NOTICE 'Error creating bucket: %', SQLERRM;
END $$;

-- Set up storage policy for logos bucket
DO $$
BEGIN
  -- Grant public access to objects in the logos bucket
  -- Create policy only if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM storage.policies
    WHERE name = 'Allow public access to logos'
  ) THEN
    CREATE POLICY "Allow public access to logos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'logos');
  END IF;

  -- Allow authenticated users to upload to their folder
  IF NOT EXISTS (
    SELECT 1
    FROM storage.policies
    WHERE name = 'Allow authenticated users to upload logos'
  ) THEN
    CREATE POLICY "Allow authenticated users to upload logos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'logos' AND (auth.uid())::text = SPLIT_PART(name, '/', 1));
  END IF;

  -- Allow owners to update their uploads
  IF NOT EXISTS (
    SELECT 1
    FROM storage.policies
    WHERE name = 'Allow users to update their logos'
  ) THEN
    CREATE POLICY "Allow users to update their logos"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'logos' AND (auth.uid())::text = SPLIT_PART(name, '/', 1));
  END IF;
END $$;
