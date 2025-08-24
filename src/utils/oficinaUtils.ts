
import { supabase } from '@/lib/supabase';

/**
 * Função segura para garantir que existe uma oficina para o usuário
 * NUNCA sobrescreve nome_oficina se já existe
 */
export const ensureOficinaOnLogin = async (userId: string, fallbackName?: string) => {
  try {
    // Verificar se já existe oficina
    const { data: existing, error: selectError } = await supabase
      .from('oficinas')
      .select('id, nome_oficina, user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError && !selectError.message?.includes('No rows found')) {
      throw selectError;
    }

    if (existing) {
      // ✅ Já existe: NÃO toque em nome_oficina, apenas atualizar campos voláteis
      console.log('✅ Oficina já existe, não alterando nome:', existing.nome_oficina);
      return existing;
    }

    // ❗ Criar somente aqui e com o nome certo (sem default "Minha Oficina")
    const nome = (fallbackName ?? '').trim();
    if (!nome) {
      throw new Error('Nome da oficina ausente na criação inicial');
    }

    console.log('🏗️ Criando nova oficina com nome:', nome);

    const { data: created, error: insertError } = await supabase
      .from('oficinas')
      .insert({
        user_id: userId,
        nome_oficina: nome,
        is_active: true,
        ativo: true
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return created;

  } catch (error: any) {
    console.error('❌ Erro em ensureOficinaOnLogin:', error);
    throw error;
  }
};

/**
 * Cria payload seguro para inserção/atualização de oficina
 * Remove fallbacks hardcoded perigosos
 */
export const createSafeOficinaPayload = (formData: any, userId: string) => {
  const payload: any = {
    user_id: userId,
    is_active: true,
    ativo: true
  };

  // Só incluir nome_oficina se houver valor válido
  if (formData.nome_oficina?.trim()) {
    payload.nome_oficina = formData.nome_oficina.trim();
  }

  // Outros campos opcionais
  if (formData.cnpj?.trim()) {
    payload.cnpj = formData.cnpj.trim();
  }

  if (formData.telefone?.trim()) {
    payload.telefone = formData.telefone.trim();
  }

  if (formData.email?.trim()) {
    payload.email = formData.email.trim();
  }

  if (formData.responsavel?.trim()) {
    payload.responsavel = formData.responsavel.trim();
  }

  if (formData.endereco?.trim()) {
    payload.endereco = formData.endereco.trim();
  }

  if (formData.cidade?.trim()) {
    payload.cidade = formData.cidade.trim();
  }

  if (formData.estado?.trim()) {
    payload.estado = formData.estado.trim();
  }

  if (formData.cep?.trim()) {
    payload.cep = formData.cep.trim();
  }

  return payload;
};
