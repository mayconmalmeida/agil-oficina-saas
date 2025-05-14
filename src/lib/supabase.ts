
import { createClient } from '@supabase/supabase-js';

// Obter as variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxODAwMDAwMDAwfQ.dummy-key-for-development';

// Log para verificar se as variáveis de ambiente estão sendo carregadas
console.log('Environment variables loaded:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'Undefined',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'Undefined'
});

// Log resumido das credenciais para debug
console.log('Supabase URL status:', supabaseUrl ? 'Defined' : 'Undefined');
console.log('Supabase Anon Key status:', supabaseAnonKey ? 'Defined' : 'Undefined');

// Criar cliente Supabase com opções aprimoradas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Verificar conexão
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event, session ? 'Session exists' : 'No session');
});

// Removido a declaração duplicada de tipos para Vite Env
// O arquivo src/vite-env.d.ts já possui essas definições
