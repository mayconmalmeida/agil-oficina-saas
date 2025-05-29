
import { supabase } from '@/lib/supabase';
import { SubscriptionRPCResponse, UserSubscription } from '@/types/subscription';
import { UserProfileData } from '@/types/auth';

export const fetchUserProfile = async (userId: string): Promise<UserProfileData> => {
  try {
    // Buscar perfil do usuário
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Erro ao buscar perfil do usuário:', profileError);
      return { role: 'user', subscription: null };
    }

    const userRole = profileData?.role || 'user';

    // Buscar assinatura do usuário
    const { data: subscriptionRawData } = await supabase.rpc('get_user_subscription');
    
    let subscription = null;
    if (subscriptionRawData) {
      const subscriptionData = subscriptionRawData as unknown as SubscriptionRPCResponse;
      if (subscriptionData.success && subscriptionData.has_subscription) {
        subscription = subscriptionData.subscription;
      }
    }

    return { role: userRole, subscription };
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return { role: 'user', subscription: null };
  }
};

export const calculateCanAccessFeatures = (subscription: UserSubscription | null): boolean => {
  if (!subscription) return false;
  
  const now = new Date();
  
  // Assinatura paga ativa
  if (subscription.status === 'active' && subscription.ends_at) {
    return new Date(subscription.ends_at) > now;
  }
  
  // Trial ativo
  if (subscription.status === 'trialing' && subscription.trial_ends_at) {
    return new Date(subscription.trial_ends_at) > now;
  }
  
  return false;
};

export const signOutUser = async () => {
  await supabase.auth.signOut();
};
