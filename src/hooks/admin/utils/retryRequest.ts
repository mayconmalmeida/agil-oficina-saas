
// Função auxiliar para retry de requisições
export const retryRequest = async <T>(
  requestFn: () => Promise<{ data: T | null; error: any }>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<{ data: T | null; error: any }> => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await requestFn();
      
      // Se não há erro, retorna o resultado
      if (!result.error) {
        return result;
      }
      
      // Se o erro não é temporário (503), não tenta novamente
      if (result.error.message && !result.error.message.includes('503')) {
        return result;
      }
      
      lastError = result.error;
      
      // Aguarda antes de tentar novamente (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  return { data: null, error: lastError };
};
