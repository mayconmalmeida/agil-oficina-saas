
-- Functions related to user profiles

-- Function to create a profile while bypassing RLS
CREATE OR REPLACE FUNCTION create_profile(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (user_id, user_email, user_full_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create the profiles table if it doesn't exist
CREATE OR REPLACE FUNCTION create_profile_table() RETURNS VOID AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    -- Create the table if it doesn't exist
    CREATE TABLE profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id),
      email TEXT,
      full_name TEXT,
      nome_oficina TEXT,
      telefone TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add RLS policies
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for users to select their own profile
    CREATE POLICY select_own_profile ON profiles FOR SELECT
      USING (auth.uid() = id);
    
    -- Create policy for users to update their own profile
    CREATE POLICY update_own_profile ON profiles FOR UPDATE
      USING (auth.uid() = id);
    
    -- Create policy for users to insert their own profile
    CREATE POLICY insert_own_profile ON profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  ELSE
    -- Add columns if they don't exist
    BEGIN
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nome_oficina TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telefone TEXT;
    EXCEPTION WHEN OTHERS THEN
      -- Handle errors
      RAISE NOTICE 'Error updating profiles table: %', SQLERRM;
    END;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
