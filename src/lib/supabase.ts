
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/integrations/supabase/types'

// Usar variáveis de ambiente quando disponíveis (fallback para valores atuais)
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL ?? 'https://yjhcozddtbpzvnppcggf.supabase.co'
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0'

// Configuração de debug
const DEBUG = true;

// Modo offline para debug - quando true, simula uma conexão bem-sucedida sem acessar o Supabase
// A autenticação sempre será online, independente do modo offline
export const OFFLINE_MODE = false; // Desativado para permitir conexão real com o Supabase
export const AUTH_ALWAYS_ONLINE = true; // Autenticação sempre online

// ✅ Garantir apenas UMA instância do Supabase Client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'oficina-go-auth',
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'oficina-go-app'
    },
    fetch: (url, options) => {
      if (DEBUG) {
        console.log(`[Supabase] Requisição para: ${url}`);
      }
      return fetch(url, {
        ...options,
        // Omitindo credentials para usar o padrão do navegador
        mode: 'cors'
      }).then(response => {
        if (DEBUG) {
          console.log(`[Supabase] Resposta de ${url}: ${response.status}`);
        }
        return response;
      }).catch(error => {
        console.error(`[Supabase] Erro na requisição para ${url}:`, error);
        throw error;
      });
    }
  }
})

// Verifica se a URL contém operações de autenticação
const isAuthOperation = (url = '') => {
  return url.includes('/auth/') || url.includes('auth');
};

export const testSupabaseConnection = async (maxRetries = 0): Promise<boolean> => {
  // Se o modo offline estiver ativado, retorna true imediatamente
  // Exceto para operações de autenticação
  if (OFFLINE_MODE && !AUTH_ALWAYS_ONLINE) {
    console.log('[Supabase] Modo offline ativado - simulando conexão bem-sucedida');
    return true;
  }

  const attemptConnection = async (): Promise<boolean> => {
    try {
      console.log('[Supabase] Testando conexão (não bloqueante)...');

      // Timeout curto; se exceder, seguimos sem bloquear login
      const timeoutMs = 2000;
      const timeoutSentinel = Symbol('timeout');
      const timeoutPromise = new Promise<typeof timeoutSentinel>((resolve) => {
        setTimeout(() => resolve(timeoutSentinel), timeoutMs);
      });

      const result = await Promise.race([supabase.auth.getSession(), timeoutPromise]);

      if (result === timeoutSentinel) {
        console.warn('[Supabase] Conexão lenta/bloqueada; prosseguindo sem travar login');
        return true;
      }

      const { data, error } = result as any;
      if (error) {
        console.error('[Supabase] Erro na conexão (auth):', error.message || error);
        return false;
      }

      console.log('[Supabase] Conexão de auth verificada', !!data?.session);
      return true;
    } catch (error: any) {
      console.error('[Supabase] Erro ao testar conexão (exec):', error?.message || error);
      return true; // Em erro inesperado, não bloquear login
    }
  };

  // Executar uma única tentativa não bloqueante
  return await attemptConnection();
}
