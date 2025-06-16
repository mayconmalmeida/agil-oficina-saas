
import { supabase } from '@/lib/supabase';

interface AIRequest {
  type: 'diagnostico' | 'suporte';
  message: string;
}

interface AIResponse {
  success: boolean;
  answer?: string;
  causes?: string[];
  error?: string;
}

export const callAI = async (type: 'diagnostico' | 'suporte', message: string): Promise<AIResponse> => {
  try {
    console.log(`Chamando IA para ${type}:`, message);
    
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: { type, message }
    });

    console.log('Resposta da função:', data);
    console.log('Erro da função:', error);

    if (error) {
      console.error('Erro na função de IA:', error);
      return {
        success: false,
        error: `Erro na função: ${error.message}`
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'Nenhuma resposta recebida da IA'
      };
    }

    return data;
  } catch (error) {
    console.error('Erro ao chamar IA:', error);
    return {
      success: false,
      error: `Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
};
