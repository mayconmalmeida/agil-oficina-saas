
import { isTemporaryError, waitWithBackoff } from './connectionUtils';

// Função auxiliar para retry de requisições com melhor tratamento de erros
export const retryRequest = async <T>(
  requestFn: () => Promise<{ data: T | null; error: any; count?: number | null }>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<{ data: T | null; error: any; count?: number | null }> => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Tentativa ${i + 1} de ${maxRetries}...`);
      const result = await requestFn();
      
      // Se não há erro, retorna o resultado
      if (!result.error) {
        console.log(`✅ Sucesso na tentativa ${i + 1}:`, {
          hasData: !!result.data,
          count: result.count
        });
        return result;
      }
      
      // Verificar se o erro é temporário
      if (!isTemporaryError(result.error)) {
        console.log(`❌ Erro permanente na tentativa ${i + 1}:`, {
          message: result.error.message,
          code: result.error.code || result.error.status
        });
        return result;
      }
      
      lastError = result.error;
      console.log(`⚠️ Erro temporário na tentativa ${i + 1}:`, {
        message: lastError.message,
        code: lastError.code || lastError.status
      });
      
      // Aguarda antes de tentar novamente se não for a última tentativa
      if (i < maxRetries - 1) {
        await waitWithBackoff(i, baseDelay);
      }
    } catch (error) {
      console.log(`💥 Exceção na tentativa ${i + 1}:`, error);
      lastError = error;
      
      if (i < maxRetries - 1 && isTemporaryError(error)) {
        await waitWithBackoff(i, baseDelay);
      } else {
        break;
      }
    }
  }
  
  console.log('❌ Todas as tentativas falharam, retornando último erro:', {
    message: lastError?.message,
    code: lastError?.code || lastError?.status
  });
  return { data: null, error: lastError, count: 0 };
};
