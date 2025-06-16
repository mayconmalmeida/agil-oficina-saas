
import { useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/**
 * Hook otimizado para ouvir mudanças de sessão sem causar loops infinitos.
 */
export function useAuthSessionListener() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const isInitialized = useRef(false);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    // Evitar múltiplas inicializações
    if (isInitialized.current) return;
    isInitialized.current = true;

    console.log('useAuthSessionListener: Inicializando listener único');
    
    let isMounted = true;

    const handleAuthStateChange = (event: string, session: Session | null) => {
      if (!isMounted) return;
      
      console.log('useAuthSessionListener: Evento de autenticação:', event, {
        sessionExists: !!session,
        userEmail: session?.user?.email
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Marcar como carregado apenas na primeira vez
      if (initialLoad) {
        setInitialLoad(false);
      }
    };

    // Registrar listener apenas uma vez
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    subscriptionRef.current = subscription;

    // Buscar sessão inicial apenas uma vez
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      
      if (error) {
        console.error('useAuthSessionListener: Erro ao buscar sessão inicial:', error);
      }
      
      console.log('useAuthSessionListener: Sessão inicial:', {
        sessionExists: !!session,
        userEmail: session?.user?.email
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      setInitialLoad(false);
    });

    return () => {
      console.log('useAuthSessionListener: Limpando recursos');
      isMounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []); // Array vazio - executar apenas uma vez

  return { session, user, initialLoad };
}
