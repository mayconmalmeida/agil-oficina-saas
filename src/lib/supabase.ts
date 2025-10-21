
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/integrations/supabase/types'

const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0'

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

export const testSupabaseConnection = async (maxRetries = 2): Promise<boolean> => {
  // Se o modo offline estiver ativado, retorna true imediatamente
  // Exceto para operações de autenticação
  if (OFFLINE_MODE && !AUTH_ALWAYS_ONLINE) {
    console.log('[Supabase] Modo offline ativado - simulando conexão bem-sucedida');
    return true;
  }

  let retries = 0;
  
  const attemptConnection = async (): Promise<boolean> => {
    try {
      console.log(`[Supabase] Testando conexão... (tentativa ${retries + 1}/${maxRetries + 1})`);
      
      // Adicionar timeout para evitar espera infinita
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log('[Supabase] Timeout de conexão atingido (180s)');
      }, 180000); // 180 segundos de timeout (aumentado para 3 minutos)
      
      // Usar uma tabela pública para teste de conexão
      const { data, error } = await supabase.from('plan_configurations').select('id').limit(1).abortSignal(controller.signal);
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('[Supabase] Erro na conexão:', error.message);
        return false;
      }
      
      console.log('[Supabase] Conexão estabelecida com sucesso!', data);
      return true;
    } catch (error) {
      console.error('[Supabase] Erro ao testar conexão:', error);
      return false;
    }
  };
  
  // Primeira tentativa
  let connected = await attemptConnection();
  
  // Tentativas adicionais se necessário
  while (!connected && retries < maxRetries) {
    retries++;
    console.log(`[Supabase] Tentando reconectar (${retries}/${maxRetries})...`);
    // Esperar um pouco antes de tentar novamente (backoff exponencial)
    await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    connected = await attemptConnection();
  }
  
  return connected;
}
