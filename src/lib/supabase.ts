
import { createClient } from '@supabase/supabase-js';

// Use the provided Supabase credentials
const supabaseUrl = "https://yjhcozddtbpzvnppcggf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0";

// Log for debugging that we're using fixed credentials
console.log('Using fixed Supabase credentials:', {
  SUPABASE_URL: supabaseUrl ? 'Defined' : 'Undefined',
  SUPABASE_ANON_KEY: supabaseAnonKey ? 'Defined (value hidden)' : 'Undefined'
});

// Create Supabase client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      fetch: (url: RequestInfo, init?: RequestInit) => {
        return fetch(url, init).catch(err => {
          console.error('Supabase fetch error:', err);
          throw err;
        });
      }
    }
  }
);

// Verify connection and log auth events
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event, session ? 'Session exists' : 'No session');
});

// Function to test the Supabase connection
export const testSupabaseConnection = async () => {
  try {
    // Just test auth status as a simple connection test
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log('Supabase connection successful!', data.session ? 'With session' : 'No session');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};
