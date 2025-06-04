
// Função auxiliar para retry de requisições
export const retryRequest = async <T>(
  requestFn: () => Promise<{ data: T | null; error: any; count?: number | null }>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<{ data: T | null; error: any; count?: number | null }> => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Tentativa ${i + 1} de ${maxRetries}...`);
      const result = await requestFn();
      
      // Se não há erro, retorna o resultado
      if (!result.error) {
        console.log(`Sucesso na tentativa ${i + 1}:`, result);
        return result;
      }
      
      // Se o erro não é temporário (503), não tenta novamente
      if (result.error.message && !result.error.message.includes('503')) {
        console.log(`Erro não temporário na tentativa ${i + 1}:`, result.error);
        return result;
      }
      
      lastError = result.error;
      console.log(`Erro temporário na tentativa ${i + 1}:`, lastError);
      
      // Aguarda antes de tentar novamente (exponential backoff)
      if (i < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, i);
        console.log(`Aguardando ${waitTime}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    } catch (error) {
      console.log(`Exceção na tentativa ${i + 1}:`, error);
      lastError = error;
      if (i < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, i);
        console.log(`Aguardando ${waitTime}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  console.log('Todas as tentativas falharam, retornando último erro:', lastError);
  return { data: null, error: lastError, count: 0 };
};
