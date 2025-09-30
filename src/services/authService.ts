
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
  trial_ends_at?: string | null;
  plano?: string | null;
  trial_started_at?: string | null;
}

export const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  console.log('fetchUserProfile: Buscando perfil para usuário:', userId);
  
  try {
    console.log('fetchUserProfile: Iniciando busca do perfil...');
    
    // Adicionar timeout de 15 segundos para evitar travamentos
    const profilePromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout na consulta do perfil')), 30000);
    });

    const { data: profile, error: profileError } = await Promise.race([
      profilePromise,
      timeoutPromise
    ]) as any;
    
    console.log('fetchUserProfile: Resultado da consulta profiles:', { profile, profileError });

    if (profileError) {
      console.error('fetchUserProfile: Erro ao buscar perfil:', profileError);
      // Se falhar, criar perfil básico
      const basicProfile: UserProfile = {
        id: userId,
        email: '',
        role: 'user',
        nome_oficina: null,
        telefone: null,
        is_active: true,
        subscription: null,
        oficina_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        trial_ends_at: null,
        plano: 'Essencial',
        trial_started_at: null
      };
      console.log('fetchUserProfile: Usando perfil básico devido a erro');
      return basicProfile;
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
        updated_at: new Date().toISOString(),
        trial_ends_at: null,
        plano: 'Essencial',
        trial_started_at: null
      };
    }

    // Buscar oficina se existir
    let oficina_id = null;
    if (profile.role === 'oficina' || profile.role === 'admin' || profile.role === 'superadmin') {
      try {
        console.log('fetchUserProfile: Buscando oficina para role:', profile.role);
        
        // Adicionar timeout para consulta da oficina
        const oficinaPromise = supabase
          .from('oficinas')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        const oficinaTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout na consulta da oficina')), 20000);
        });

        const { data: oficina } = await Promise.race([
          oficinaPromise,
          oficinaTimeoutPromise
        ]) as any;
        
        oficina_id = oficina?.id || null;
        console.log('fetchUserProfile: Oficina encontrada:', !!oficina_id);
      } catch (error) {
        console.warn('fetchUserProfile: Erro ao buscar oficina:', error);
      }
    } else {
      console.log('fetchUserProfile: Pulando busca de oficina para role:', profile.role);
    }

    // Buscar assinatura se tiver oficina
    let subscription: UserSubscription | null = null;
    if (oficina_id) {
      try {
        console.log('fetchUserProfile: Buscando assinatura para oficina:', oficina_id);
        
        // Adicionar timeout para consulta da assinatura
        const subscriptionPromise = supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const subscriptionTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout na consulta da assinatura')), 20000);
        });

        const { data: subscriptionData } = await Promise.race([
          subscriptionPromise,
          subscriptionTimeoutPromise
        ]) as any;
        
        subscription = subscriptionData as UserSubscription;
        console.log('fetchUserProfile: Assinatura encontrada:', !!subscription);
      } catch (error) {
        console.warn('fetchUserProfile: Erro ao buscar assinatura:', error);
      }
    } else {
      console.log('fetchUserProfile: Pulando busca de assinatura - sem oficina');
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
      updated_at: profile.created_at, // Use created_at as fallback
      trial_ends_at: profile.trial_ends_at,
      plano: profile.plano,
      trial_started_at: profile.trial_started_at
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
    // Retornar perfil básico em caso de erro
    const basicProfile: UserProfile = {
      id: userId,
      email: '',
      role: 'user',
      nome_oficina: null,
      telefone: null,
      is_active: true,
      subscription: null,
      oficina_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      trial_ends_at: null,
      plano: 'Essencial',
      trial_started_at: null
    };
    console.log('fetchUserProfile: Retornando perfil básico devido a erro geral');
    return basicProfile;
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
