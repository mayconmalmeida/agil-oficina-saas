
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { fetchUserProfile, calculateCanAccessFeatures } from '@/services/authService';
import { AuthUser } from '@/types/auth';

/**
 * Faz busca do "profile" e status de assinatura para um User Supabase.
 * Retorna rapidamente (null) se não há user informado!
 */
export function useUserProfileData(authUser: User | null) {
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser) {
      setProfile(null);
      setRole(null);
      return;
    }

    setLoading(true);
    fetchUserProfile(authUser.id)
      .then(userData => {
        const isAdmin = userData.role === 'admin' || userData.role === 'superadmin';
        const canAccessFeatures = calculateCanAccessFeatures(userData.subscription, userData.role);

        const formattedSubscription = userData.subscription ? {
          id: userData.subscription.id,
          user_id: authUser.id,
          plan_type: userData.subscription.plan_type as
            | "essencial_mensal"
            | "essencial_anual"
            | "premium_mensal"
            | "premium_anual"
            | "free_trial_essencial"
            | "free_trial_premium",
          status: userData.subscription.status as
            | "active"
            | "trialing"
            | "cancelled"
            | "expired",
          starts_at: userData.subscription.starts_at,
          ends_at: userData.subscription.ends_at || null,
          trial_ends_at: userData.subscription.trial_ends_at || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } : null;

        setProfile({
          ...authUser,
          role: userData.role,
          isAdmin,
          canAccessFeatures,
          subscription: formattedSubscription
        });
        setRole(userData.role);
      })
      .catch(() => {
        // fallback perfil mínimo
        setProfile({
          ...authUser,
          role: 'user',
          isAdmin: false,
          canAccessFeatures: true,
          subscription: null
        });
        setRole('user');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authUser]);

  return { profile, loading, role };
}
