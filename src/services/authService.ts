
import { supabase } from '@/lib/supabase';
import { UserSubscription } from '@/types/subscription';

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  nome_oficina: string | null;
  telefone: string | null;
  is_active: boolean;
  subscription: UserSubscription | null;
  oficina_id: string | null;
  created_at: string;
  updated_at: string;
}

export const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  console.log('fetchUserProfile: Buscando perfil para usuário:', userId);
  
  try {
    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('fetchUserProfile: Erro ao buscar perfil:', profileError);
      throw new Error(`Erro ao buscar perfil: ${profileError.message}`);
    }

    if (!profile) {
      console.log('fetchUserProfile: Perfil não encontrado, criando perfil básico');
      // Se não encontrar perfil, retornar dados básicos
      return {
        id: userId,
        email: '',
        role: 'user',
        nome_oficina: null,
        telefone: null,
        is_active: true,
        subscription: null,
        oficina_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    // Buscar oficina se existir
    let oficina_id = null;
    if (profile.role === 'oficina' || profile.role === 'admin' || profile.role === 'superadmin') {
      try {
        const { data: oficina } = await supabase
          .from('oficinas')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        
        oficina_id = oficina?.id || null;
      } catch (error) {
        console.warn('fetchUserProfile: Erro ao buscar oficina:', error);
      }
    }

    // Buscar assinatura se tiver oficina
    let subscription: UserSubscription | null = null;
    if (oficina_id) {
      try {
        const { data: subscriptionData } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        subscription = subscriptionData as UserSubscription;
      } catch (error) {
        console.warn('fetchUserProfile: Erro ao buscar assinatura:', error);
      }
    }

    const userProfile: UserProfile = {
      id: profile.id,
      email: profile.email || '',
      role: profile.role || 'user',
      nome_oficina: profile.nome_oficina,
      telefone: profile.telefone,
      is_active: profile.is_active ?? true,
      subscription,
      oficina_id,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };

    console.log('fetchUserProfile: Perfil carregado com sucesso:', {
      email: userProfile.email,
      role: userProfile.role,
      hasOficina: !!oficina_id,
      hasSubscription: !!subscription
    });

    return userProfile;
  } catch (error) {
    console.error('fetchUserProfile: Erro geral:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  console.log('signOutUser: Iniciando logout');
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('signOutUser: Erro ao fazer logout:', error);
      throw error;
    }
    console.log('signOutUser: Logout realizado com sucesso');
  } catch (error) {
    console.error('signOutUser: Erro no logout:', error);
    throw error;
  }
};
