
import { supabase } from '@/lib/supabase';

export const validateOficinaUniqueness = async (
  email: string, 
  cnpj: string, 
  currentUserId?: string
): Promise<{ valid: boolean; message?: string }> => {
  try {
    console.log('🔍 Validando unicidade de oficina:', { email, cnpj, currentUserId });
    
    // Verificar email duplicado na tabela oficinas
    let emailQuery = supabase
      .from('oficinas')
      .select('id, user_id, email, nome_oficina')
      .eq('email', email);
    
    if (currentUserId) {
      emailQuery = emailQuery.neq('user_id', currentUserId);
    }
    
    const { data: emailData, error: emailError } = await emailQuery;
    
    if (emailError) {
      console.error('❌ Erro ao verificar email na tabela oficinas:', emailError);
      return { valid: false, message: 'Erro ao verificar email na base de dados' };
    }
    
    if (emailData && emailData.length > 0) {
      console.log('❌ Email já existe na tabela oficinas:', emailData);
      return { 
        valid: false, 
        message: `Este email (${email}) já está cadastrado para a oficina: ${emailData[0].nome_oficina || 'Sem nome'}` 
      };
    }
    
    // Verificar CNPJ duplicado na tabela oficinas (apenas se CNPJ foi fornecido)
    if (cnpj && cnpj.trim()) {
      let cnpjQuery = supabase
        .from('oficinas')
        .select('id, user_id, cnpj, nome_oficina')
        .eq('cnpj', cnpj);
      
      if (currentUserId) {
        cnpjQuery = cnpjQuery.neq('user_id', currentUserId);
      }
      
      const { data: cnpjData, error: cnpjError } = await cnpjQuery;
      
      if (cnpjError) {
        console.error('❌ Erro ao verificar CNPJ na tabela oficinas:', cnpjError);
        return { valid: false, message: 'Erro ao verificar CNPJ na base de dados' };
      }
      
      if (cnpjData && cnpjData.length > 0) {
        console.log('❌ CNPJ já existe na tabela oficinas:', cnpjData);
        return { 
          valid: false, 
          message: `Este CNPJ (${cnpj}) já está cadastrado para a oficina: ${cnpjData[0].nome_oficina || 'Sem nome'}` 
        };
      }
    }
    
    console.log('✅ Validação de unicidade passou - email e CNPJ únicos');
    return { valid: true };
  } catch (error) {
    console.error('💥 Erro inesperado na validação:', error);
    return { valid: false, message: 'Erro interno na validação' };
  }
};

// Nova função para verificar se uma oficina já existe para um usuário
export const checkExistingOficina = async (userId: string): Promise<{ 
  exists: boolean; 
  oficina?: any; 
  message?: string 
}> => {
  try {
    console.log('🔍 Verificando se já existe oficina para o usuário:', userId);
    
    const { data: oficinaData, error } = await supabase
      .from('oficinas')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('❌ Erro ao verificar oficina existente:', error);
      return { exists: false, message: 'Erro ao verificar oficina existente' };
    }
    
    if (oficinaData) {
      console.log('✅ Oficina já existe para este usuário:', oficinaData);
      return { 
        exists: true, 
        oficina: oficinaData,
        message: `Já existe uma oficina cadastrada para este usuário: ${oficinaData.nome_oficina}` 
      };
    }
    
    console.log('✅ Nenhuma oficina encontrada para este usuário');
    return { exists: false };
  } catch (error) {
    console.error('💥 Erro inesperado ao verificar oficina:', error);
    return { exists: false, message: 'Erro interno na verificação' };
  }
};
