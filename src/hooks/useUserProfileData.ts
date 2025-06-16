
import { useEffect, useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { fetchUserProfile, calculateCanAccessFeatures } from '@/services/authService';
import { AuthUser } from '@/types/auth';
import { UserSubscription } from '@/types/subscription';

export const useUserProfileData = (user: User | null) => {
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const isLoadingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Evitar execuções desnecessárias se o user ID não mudou
    if (lastUserIdRef.current === user?.id) return;
    
    // Evitar múltiplas execuções simultâneas
    if (isLoadingRef.current) return;

    const loadUserProfile = async () => {
      console.log('useUserProfileData: Carregando perfil para:', user?.id);
      
      if (!user) {
        console.log('useUserProfileData: Usuário não encontrado, limpando estado');
        setProfile(null);
        setRole(null);
        setLoading(false);
        lastUserIdRef.current = null;
        return;
      }

      // Verificar se já estamos carregando
      if (isLoadingRef.current) return;

      try {
        isLoadingRef.current = true;
        setLoading(true);
        lastUserIdRef.current = user.id;
        
        const userProfile = await fetchUserProfile(user.id);
        console.log('useUserProfileData: Perfil carregado:', userProfile);
        
        const canAccessFeatures = calculateCanAccessFeatures(userProfile.subscription, userProfile.role);
        
        const authUser: AuthUser = {
          ...user,
          role: userProfile.role,
          isAdmin: userProfile.role === 'admin' || userProfile.role === 'superadmin',
          canAccessFeatures,
          subscription: userProfile.subscription ? {
            id: userProfile.subscription.id,
            user_id: user.id,
            created_at: userProfile.subscription.created_at || new Date().toISOString(),
            updated_at: userProfile.subscription.updated_at || new Date().toISOString(),
            plan_type: userProfile.subscription.plan_type as UserSubscription['plan_type'],
            status: userProfile.subscription.status as UserSubscription['status'],
            starts_at: userProfile.subscription.starts_at,
            ends_at: userProfile.subscription.ends_at || null,
            trial_ends_at: userProfile.subscription.trial_ends_at || null
          } : undefined,
          plano: userProfile.plano || 'Premium',
          trial_started_at: userProfile.trial_started_at
        };

        setProfile(authUser);
        setRole(userProfile.role);
        
      } catch (error) {
        console.error('useUserProfileData: Erro ao carregar perfil:', error);
        
        // Criar perfil de fallback para evitar loops
        if (user) {
          const fallbackProfile: AuthUser = {
            ...user,
            role: 'user',
            isAdmin: false,
            canAccessFeatures: true,
            plano: 'Premium',
            trial_started_at: new Date().toISOString()
          };
          
          setProfile(fallbackProfile);
          setRole('user');
        }
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    loadUserProfile();
  }, [user?.id]); // Apenas user.id como dependência

  return { profile, loading, role };
};
