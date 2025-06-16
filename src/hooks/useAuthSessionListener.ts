
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/**
 * Hook apenas para ouvir mudanças de sessão.
 * Não executa nada além de retornar user/session originais do Supabase.
 */
export function useAuthSessionListener() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    let mounted = true;
    let hasInitialized = false;
    
    console.log('useAuthSessionListener: Iniciando listener de autenticação');
    
    // Sempre registrar listener ANTES de buscar sessão inicial
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('useAuthSessionListener: Evento de autenticação:', event, {
          sessionExists: !!session,
          userEmail: session?.user?.email,
          userId: session?.user?.id
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Marcar como carregado apenas uma vez
        if (!hasInitialized) {
          hasInitialized = true;
          setInitialLoad(false);
        }
      }
    );

    // Buscar sessão inicial apenas uma vez
    if (!hasInitialized) {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (!mounted) return;
        
        if (error) {
          console.error('useAuthSessionListener: Erro ao buscar sessão inicial:', error);
        } else {
          console.log('useAuthSessionListener: Sessão inicial obtida:', {
            sessionExists: !!session,
            userEmail: session?.user?.email,
            userId: session?.user?.id
          });
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        hasInitialized = true;
        setInitialLoad(false);
      });
    }

    return () => {
      console.log('useAuthSessionListener: Limpando listener');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Array de dependências vazio para executar apenas uma vez

  return { session, user, initialLoad };
}
