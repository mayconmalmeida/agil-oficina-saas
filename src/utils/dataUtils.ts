
// Utilitários para gerenciamento de dados reais vs mockados

export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

export const shouldUseMockData = (): boolean => {
  // Em produção, sempre usar dados reais
  // Em desenvolvimento, usar variável de ambiente para controlar
  return isDevelopment() && import.meta.env.VITE_USE_MOCK_DATA === 'true';
};

// Função para limpar dados mockados e usar apenas dados reais
export const getRealDataOnly = <T>(data: T[]): T[] => {
  // Em produção ou quando configurado, retorna apenas dados reais do banco
  return shouldUseMockData() ? [] : data;
};

// Função para validar se os dados são do banco de dados
export const isRealData = (data: any): boolean => {
  return data && typeof data === 'object' && 'id' in data && 'created_at' in data;
};
