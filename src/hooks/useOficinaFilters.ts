import { useState, useEffect } from 'react';
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