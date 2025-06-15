
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Hook apenas para ouvir mudanças de sessão! Nenhuma lógica extra.
export function useAuthSessionListener() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Verifica sessão inicial (em mount)
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
      }
    })();

    return () => {
      mounted = false;
      listener.unsubscribe();
    };
  }, []);

  // Só retorna dados brutos, sem tratamentos!
  return { session, user };
}
