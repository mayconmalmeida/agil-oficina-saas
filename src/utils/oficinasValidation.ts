
import { supabase } from '@/lib/supabase';

export const validateOficinaUniqueness = async (
  email: string, 
  cnpj: string, 
  currentUserId?: string
): Promise<{ valid: boolean; message?: string }> => {
  try {
    // Verificar email duplicado
    let emailQuery = supabase
      .from('oficinas')
      .select('id, user_id')
      .eq('email', email);
    
    if (currentUserId) {
      emailQuery = emailQuery.neq('user_id', currentUserId);
    }
    
    const { data: emailData, error: emailError } = await emailQuery;
    
    if (emailError) {
      console.error('Erro ao verificar email:', emailError);
      return { valid: false, message: 'Erro ao verificar email' };
    }
    
    if (emailData && emailData.length > 0) {
      return { valid: false, message: 'Este email já está conectado a outra oficina' };
    }
    
    // Verificar CNPJ duplicado
    if (cnpj) {
      let cnpjQuery = supabase
        .from('oficinas')
        .select('id, user_id')
        .eq('cnpj', cnpj);
      
      if (currentUserId) {
        cnpjQuery = cnpjQuery.neq('user_id', currentUserId);
      }
      
      const { data: cnpjData, error: cnpjError } = await cnpjQuery;
      
      if (cnpjError) {
        console.error('Erro ao verificar CNPJ:', cnpjError);
        return { valid: false, message: 'Erro ao verificar CNPJ' };
      }
      
      if (cnpjData && cnpjData.length > 0) {
        return { valid: false, message: 'Este CNPJ já está cadastrado em outra oficina' };
      }
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Erro na validação:', error);
    return { valid: false, message: 'Erro interno na validação' };
  }
};
