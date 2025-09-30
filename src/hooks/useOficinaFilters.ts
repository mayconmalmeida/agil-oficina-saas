import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface OficinaFilters {
  oficina_id: string | null;
  isReady: boolean;
  user_id: string | null;
}

/**
 * ✅ Hook centralizado para filtros por oficina_id
 * Garante que todas as queries usem o oficina_id correto
 */
export const useOficinaFilters = (): OficinaFilters => {
  const { user } = useAuth();
  const [oficinaId, setOficinaId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadOficinaId = async () => {
      if (!user?.id) {
        setIsReady(true);
        return;
      }

      try {
        console.log('[useOficinaFilters] Buscando oficina_id para user:', user.id);

        // Primeiro tentar pegar do perfil
        if (user.oficina_id) {
          console.log('[useOficinaFilters] ✅ oficina_id encontrado no perfil:', user.oficina_id);
          setOficinaId(user.oficina_id);
          setIsReady(true);
          return;
        }

        // Se não tem no perfil, buscar na tabela oficinas
        const { data: oficina, error } = await supabase
          .from('oficinas')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('[useOficinaFilters] Erro ao buscar oficina:', error);
          setIsReady(true);
          return;
        }

        if (oficina) {
          console.log('[useOficinaFilters] ✅ oficina_id encontrado na tabela oficinas:', oficina.id);
          setOficinaId(oficina.id);
          
          // Atualizar o perfil para ter oficina_id na próxima vez
          await supabase
            .from('profiles')
            .update({ oficina_id: oficina.id })
            .eq('id', user.id);
        } else {
          console.log('[useOficinaFilters] ⚠️ Nenhuma oficina encontrada para user:', user.id);
        }
      } catch (error) {
        console.error('[useOficinaFilters] Erro inesperado:', error);
      } finally {
        setIsReady(true);
      }
    };

    loadOficinaId();
  }, [user?.id, user?.oficina_id]);

  return {
    oficina_id: oficinaId,
    isReady,
    user_id: user?.id || null
  };
};

/**
 * ✅ Função helper para criar filtros padrão
 */
export const getOficinaFilter = (oficinaId: string | null, userId: string | null) => {
  if (oficinaId) {
    return { column: 'oficina_id', value: oficinaId };
  }
  
  if (userId) {
    return { column: 'user_id', value: userId };
  }
  
  return null;
};

/**
 * ✅ Garantir que oficina existe e não é duplicada
 * Nova oficina sempre começa com dados zerados
 */
export const ensureOficinaExists = async (userId: string, userEmail: string, nomeOficina?: string): Promise<string | null> => {
  try {
    console.log('[ensureOficinaExists] 🔍 Verificando oficina para userId:', userId);
    
    // Verificar se já existe oficina
    const { data: existingOficina } = await supabase
      .from('oficinas')
      .select('id, nome_oficina')
      .or(`email.eq.${userEmail},user_id.eq.${userId}`)
      .maybeSingle();

    if (existingOficina) {
      console.log('[ensureOficinaExists] ✅ Oficina já existe:', existingOficina.id);
      
      // Atualizar o perfil para garantir que está vinculado
      await supabase
        .from('profiles')
        .update({ oficina_id: existingOficina.id })
        .eq('id', userId);
      
      return existingOficina.id;
    }

    // Criar nova oficina com dados zerados
    const { data: newOficina, error: insertError } = await supabase
      .from('oficinas')
      .insert({
        nome_oficina: nomeOficina || 'Minha Oficina',
        email: userEmail,
        user_id: userId,
        is_active: true,
        ativo: true,
        plano: 'Premium' // Nova oficina sempre Premium
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[ensureOficinaExists] ❌ Erro ao criar oficina:', insertError);
      return null;
    }

    console.log('[ensureOficinaExists] ✅ Nova oficina criada com dados zerados:', newOficina.id);
    
    // Vincular ao perfil
    await supabase
      .from('profiles')
      .update({ oficina_id: newOficina.id })
      .eq('id', userId);

    // Importar apenas tipos de serviços padrão para nova oficina
    await importDefaultServiceTypes(newOficina.id, userId);

    return newOficina.id;
  } catch (error) {
    console.error('[ensureOficinaExists] 💥 Erro:', error);
    return null;
  }
};

/**
 * ✅ Importar apenas tipos de serviços padrão para nova oficina
 */
const importDefaultServiceTypes = async (oficinaId: string, userId: string) => {
  try {
    console.log('[importDefaultServiceTypes] 📋 Importando tipos de serviços padrão');
    
    const defaultServiceTypes = [
      { nome: 'Troca de Óleo', tipo: 'servico', valor: 50, descricao: 'Troca de óleo do motor' },
      { nome: 'Alinhamento', tipo: 'servico', valor: 80, descricao: 'Alinhamento de rodas' },
      { nome: 'Balanceamento', tipo: 'servico', valor: 60, descricao: 'Balanceamento de rodas' },
      { nome: 'Revisão Geral', tipo: 'servico', valor: 200, descricao: 'Revisão completa do veículo' },
      { nome: 'Freios', tipo: 'servico', valor: 150, descricao: 'Manutenção do sistema de freios' }
    ];

    const servicesToInsert = defaultServiceTypes.map(service => ({
      ...service,
      user_id: userId,
      oficina_id: oficinaId,
      is_active: true
    }));

    const { error } = await supabase
      .from('services')
      .insert(servicesToInsert);

    if (error) {
      console.error('[importDefaultServiceTypes] ❌ Erro ao importar:', error);
    } else {
      console.log('[importDefaultServiceTypes] ✅ Tipos de serviços importados com sucesso');
    }
  } catch (error) {
    console.error('[importDefaultServiceTypes] 💥 Erro:', error);
  }
};
