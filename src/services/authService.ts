
import { supabase, OFFLINE_MODE, AUTH_ALWAYS_ONLINE } from '@/lib/supabase';
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

// Mock de perfil para modo offline
export const MOCK_PROFILE: UserProfile = {
  id: '307c8e18-7d29-413a-9b28-0cf18df2aed8',
  email: 'mayconm.almeida@gmail.com',
  role: 'admin',
  nome_oficina: 'Oficina de Teste',
  telefone: '(11) 99999-9999',
  is_active: true,
  subscription: {
    id: '123',
    user_id: '307c8e18-7d29-413a-9b28-0cf18df2aed8',
    plan_type: 'premium_mensal',
    status: 'active',
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    trial_ends_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  oficina_id: '456',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  trial_ends_at: null,
  plano: 'premium_mensal',
  trial_started_at: null
};

// Verificar se estamos em modo offline
const isOfflineMode = () => {
  // Sempre usar dados reais do Supabase
  return false;
};

export const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  console.log('fetchUserProfile: Buscando perfil para usuário:', userId);
  
  try {
    console.log('fetchUserProfile: Iniciando busca do perfil...');
    
    // Login sempre online - buscar perfil no Supabase
    try {
      // Usando abortController para cancelar a requisição após timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('fetchUserProfile: TIMEOUT atingido na busca do perfil - abortando requisição');
        abortController.abort();
      }, 5000); // Timeout reduzido para 5 segundos
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role, nome_oficina, telefone, is_active, created_at, updated_at, trial_ends_at, plano, trial_started_at')
        .eq('id', userId)
        .abortSignal(abortController.signal)
        .single();
        
      clearTimeout(timeoutId);
      
      console.log('fetchUserProfile: Resultado da consulta profiles:', { profile, profileError });

      if (!profileError && profile) {
        console.log('fetchUserProfile: Perfil encontrado online');
        
        // Buscar oficina se existir
        let oficina_id = null;
        if (profile.role === 'oficina' || profile.role === 'admin' || profile.role === 'superadmin') {
          try {
            console.log('fetchUserProfile: Buscando oficina para role:', profile.role);
            
            // Usar AbortController para timeout
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), 2500);
            
            const { data: oficina } = await supabase
              .from('oficinas')
              .select('id')
              .eq('user_id', userId)
              .abortSignal(abortController.signal)
              .maybeSingle();
              
            clearTimeout(timeoutId);
            
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
            
            // Usar AbortController para timeout
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), 2500);
            
            const { data: subscriptionData } = await supabase
              .from('user_subscriptions')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(1)
              .abortSignal(abortController.signal)
              .maybeSingle();
              
            clearTimeout(timeoutId);
            
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
      } else {
        throw new Error('Perfil não encontrado ou erro na consulta');
      }
    } catch (error) {
      console.error('fetchUserProfile: Erro ao buscar perfil online:', error);
      throw error; // Propagar erro para forçar falha no login
    }
  } catch (error) {
    console.error('fetchUserProfile: Erro geral:', error);
    throw new Error('Falha ao buscar perfil de usuário. Por favor, tente novamente.');
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
