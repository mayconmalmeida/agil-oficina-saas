
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Evitar múltiplas inicializações
    if (isInitialized.current) return;
    isInitialized.current = true;

    console.log('useAuthSessionListener: Inicializando listener único');
    
    let isMounted = true;

    // Timeout de segurança para forçar carregamento
    timeoutRef.current = setTimeout(() => {
      if (isMounted && initialLoad) {
        console.log('useAuthSessionListener: Timeout atingido, forçando fim do loading');
        setInitialLoad(false);
      }
    }, 3000);

    const handleAuthStateChange = (event: string, session: Session | null) => {
      if (!isMounted) return;
      
      console.log('useAuthSessionListener: Evento de autenticação:', event, {
        sessionExists: !!session,
        userEmail: session?.user?.email
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Marcar como carregado quando receber qualquer evento
      if (initialLoad) {
        setInitialLoad(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
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
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    });

    return () => {
      console.log('useAuthSessionListener: Limpando recursos');
      isMounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []); // Array vazio - executar apenas uma vez

  return { session, user, initialLoad };
}
