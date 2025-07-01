
import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { fetchUserProfile } from '@/services/authService';
import { AuthUser } from '@/types/auth';
import { UserSubscription } from '@/types/subscription';

export function useUserProfileData(user: User | null) {
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('useUserProfileData: Iniciando com usuário:', user?.email || 'nenhum');
    
    // Timeout de segurança para evitar loading infinito
    timeoutRef.current = setTimeout(() => {
      console.log('useUserProfileData: Timeout atingido, forçando fim do loading');
      setLoading(false);
    }, 2000);
    
    if (!user) {
      console.log('useUserProfileData: Usuário não encontrado, limpando estado');
      setProfile(null);
      setRole(null);
      setLoading(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      try {
        console.log('useUserProfileData: Carregando perfil para:', user.id);
        setLoading(true);
        
        const userProfile = await fetchUserProfile(user.id);
        
        if (!isMounted) return;

        console.log('useUserProfileData: Perfil carregado:', {
          id: userProfile.id,
          email: userProfile.email,
          role: userProfile.role,
          is_active: userProfile.is_active
        });
        
        // Criar o objeto AuthUser com todas as propriedades necessárias
        const authUser: AuthUser = {
          ...user,
          role: userProfile.role,
          isAdmin: userProfile.role === 'admin' || userProfile.role === 'superadmin',
          canAccessFeatures: true, // Será calculado no useOptimizedAuth
          subscription: userProfile.subscription ? {
            ...userProfile.subscription,
            user_id: userProfile.id,
            plan_type: userProfile.subscription.plan_type as UserSubscription['plan_type'],
            status: userProfile.subscription.status as UserSubscription['status'],
            ends_at: userProfile.subscription.ends_at || null,
            trial_ends_at: userProfile.subscription.trial_ends_at || null,
            created_at: userProfile.subscription.created_at || new Date().toISOString(),
            updated_at: userProfile.subscription.updated_at || new Date().toISOString()
          } : undefined,
          trial_ends_at: userProfile.trial_started_at ? 
            new Date(new Date(userProfile.trial_started_at).getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString() : 
            undefined,
          plano: userProfile.plano,
          trial_started_at: userProfile.trial_started_at,
          // Adicionar propriedades do perfil
          nome_oficina: userProfile.nome_oficina,
          telefone: userProfile.telefone || undefined,
          is_active: userProfile.is_active
        };

        setProfile(authUser);
        setRole(userProfile.role);
        
      } catch (error) {
        console.error('useUserProfileData: Erro ao carregar perfil:', error);
        if (!isMounted) return;
        
        // Em caso de erro, criar um perfil básico
        const basicAuthUser: AuthUser = {
          ...user,
          role: 'user',
          isAdmin: false,
          canAccessFeatures: true
        };
        
        setProfile(basicAuthUser);
        setRole('user');
      } finally {
        if (isMounted) {
          setLoading(false);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [user?.id]); // Usar user.id em vez de user completo para evitar re-renders desnecessários

  return { profile, loading, role };
}
