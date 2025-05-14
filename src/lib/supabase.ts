
import { createClient } from '@supabase/supabase-js';

// Obter as variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log para verificar se as variáveis de ambiente estão sendo carregadas
console.log('Environment variables loaded:', {
  VITE_SUPABASE_URL: supabaseUrl || 'Undefined',
  VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Defined (value hidden)' : 'Undefined'
});

// Verificação mais robusta de variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing!');
  console.error('Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.');
}

// Criar cliente Supabase com opções aprimoradas
export const supabase = createClient(
  supabaseUrl || 'https://fallback-url.supabase.co',  // URL fallback para evitar erro crítico
  supabaseAnonKey || 'fallback-key',  // Chave fallback para evitar erro crítico
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      fetch: (...args) => {
        return fetch(...args).catch(err => {
          console.error('Supabase fetch error:', err);
          throw err;
        });
      }
    }
  }
);

// Verificar conexão e logar eventos de autenticação
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event, session ? 'Session exists' : 'No session');
});

// Função auxiliar para testar a conexão com o Supabase
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    if (error) throw error;
    console.log('Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};

// Removido a declaração duplicada de tipos para Vite Env
// O arquivo src/vite-env.d.ts já possui essas definições
