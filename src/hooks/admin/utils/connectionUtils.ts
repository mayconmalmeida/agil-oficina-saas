
import { supabase } from '@/lib/supabase';

export interface ConnectionResult {
  isConnected: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Testa a conectividade básica com o Supabase
 */
export const testBasicConnection = async (maxRetries = 2): Promise<ConnectionResult> => {
  let retries = 0;
  
  const attemptConnection = async (): Promise<ConnectionResult> => {
    try {
      console.log(`Testando conectividade básica com Supabase... (tentativa ${retries + 1}/${maxRetries + 1})`);
      
      // Timeout ajustado para dar mais tempo à conexão
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 segundos
      
      const { data, error } = await supabase.auth.getSession();
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('Erro na conexão básica:', error);
        return {
          isConnected: false,
          error: error.message,
          statusCode: (error as any).status
        };
      }
      
      console.log('Conectividade básica OK');
      return { isConnected: true };
    } catch (error: any) {
      console.error('Erro de conectividade:', error);
      
      // Detectar tipos específicos de erro
      if (error.name === 'AbortError') {
        return {
          isConnected: false,
          error: 'Timeout de conexão (>30s)',
          statusCode: 408
        };
      }
      
      if (error.message?.includes('CORS') || error.message?.includes('Access-Control-Allow-Origin')) {
        return {
          isConnected: false,
          error: 'Erro de CORS - verifique as configurações no Supabase',
          statusCode: 400
        };
      }
      
      if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
        return {
          isConnected: false,
          error: 'Erro de rede - verifique sua conexão',
          statusCode: 0
        };
      }
      
      return {
        isConnected: false,
        error: error.message || 'Erro desconhecido',
        statusCode: (error as any).status || 500
      };
    }
  };
  
  // Primeira tentativa
  let result = await attemptConnection();
  
  // Tentativas adicionais se necessário
  while (!result.isConnected && retries < maxRetries) {
    retries++;
    console.log(`Tentando reconectar (${retries}/${maxRetries})...`);
    // Esperar um pouco antes de tentar novamente (backoff exponencial)
    await waitWithBackoff(retries);
    result = await attemptConnection();
  }
  
  return result;
};

/**
 * Verifica se um erro é temporário e pode ser tentado novamente
 */
export const isTemporaryError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = error.message || '';
  const statusCode = error.status || (error as any).code;
  
  // Erros 5xx (servidor) e alguns 4xx específicos são temporários
  const temporaryStatusCodes = [408, 429, 500, 502, 503, 504, 522, 523, 524];
  
  if (temporaryStatusCodes.includes(statusCode)) {
    return true;
  }
  
  // Erros de rede também são considerados temporários
  if (errorMessage.includes('NetworkError') || 
      errorMessage.includes('fetch') || 
      errorMessage.includes('timeout') ||
      errorMessage.includes('503')) {
    return true;
  }
  
  return false;
};

/**
 * Aguarda um tempo antes de tentar novamente, com backoff exponencial
 */
export const waitWithBackoff = async (attempt: number, baseDelay: number = 1000): Promise<void> => {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), 10000); // Max 10 segundos
  console.log(`Aguardando ${delay}ms antes da próxima tentativa...`);
  await new Promise(resolve => setTimeout(resolve, delay));
};
