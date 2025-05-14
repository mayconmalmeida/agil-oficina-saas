
import { createClient } from '@supabase/supabase-js';

// Define defaults for environment variables to prevent errors during development
// For development/testing purposes only
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxODAwMDAwMDAwfQ.dummy-key-for-development';

// Log the Supabase URL and key status without exposing sensitive data
console.log('Supabase URL status:', supabaseUrl ? 'Defined' : 'Undefined');
console.log('Supabase Anon Key status:', supabaseAnonKey ? 'Defined' : 'Undefined');

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

