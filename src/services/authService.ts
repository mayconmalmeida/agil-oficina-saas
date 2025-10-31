
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
      }, 15000); // Timeout ajustado para 15 segundos para redes lentas
      
      // Usando Promise.race para timebox da consulta de perfil
      const profilePromise = supabase
        .from('profiles')
        .select('id, email, role, nome_oficina, telefone, is_active, created_at, trial_ends_at, plano, trial_started_at')
        .eq('id', userId)
        .abortSignal(abortController.signal)
        .maybeSingle();
      
      const timeoutMs = 12000;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.log(`fetchUserProfile: TIMEBOX atingido (${timeoutMs}ms) - abortando espera do perfil`);
          reject(new Error('TIMEBOX_PROFILE'));
        }, timeoutMs);
      });
      
      let profile: any = null;
      let profileError: any = null;
      try {
        const result: any = await Promise.race([profilePromise, timeoutPromise]);
        profile = result?.data ?? result ?? null;
        profileError = result?.error ?? null;
      } catch (e) {
        console.warn('fetchUserProfile: Tempo limite na busca de perfil:', e);
        throw e;
      } finally {
        clearTimeout(timeoutId);
      }
      
      // Log detalhado do erro, se existir
      if (profileError) {
        console.warn('fetchUserProfile: Erro na consulta profiles:', {
          message: profileError?.message,
          code: profileError?.code,
          details: profileError?.details,
          hint: profileError?.hint
        });
      }

      console.log('fetchUserProfile: Resultado da consulta profiles:', { profile, profileError });

      // Fallback: se houve erro ou perfil vazio, tentar consulta com select('*')
      if ((!profile && profileError)) {
        console.log('fetchUserProfile: Tentando fallback select(*) para profiles');
        try {
          const { data: fallbackProfile, error: fallbackError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .abortSignal(abortController.signal)
            .maybeSingle();

          if (fallbackError) {
            console.warn('fetchUserProfile: Fallback também falhou:', {
              message: fallbackError?.message,
              code: fallbackError?.code,
              details: fallbackError?.details,
              hint: fallbackError?.hint
            });
          } else {
            profile = fallbackProfile as any;
            console.log('fetchUserProfile: Fallback de perfil bem-sucedido');
          }
        } catch (fallbackCatchError) {
          console.warn('fetchUserProfile: Erro no fallback select(*)', fallbackCatchError);
        }
      }

      if (profile && !profileError) {
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
        console.log('fetchUserProfile: Perfil não encontrado - tentando criar perfil básico automaticamente');
        // Cache curto de getUser para reduzir chamadas repetidas
        let cachedAuthUser: { user: any } | null = null;
        let cachedAt: number | null = null;
        const getCachedAuthUser = async (): Promise<{ user: any }> => {
          const now = Date.now();
          if (cachedAuthUser && cachedAt && now - cachedAt < 10000) {
            return cachedAuthUser;
          }
          const { data } = await supabase.auth.getUser();
          cachedAuthUser = { user: data.user };
          cachedAt = now;
          return cachedAuthUser;
        };

        try {
          const { user: authUser } = await getCachedAuthUser();
          if (authUser?.id === userId) {
            const now = new Date().toISOString();
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: authUser.email,
                role: 'user',
                is_active: true,
                created_at: now
              });

            let createdProfile: any = null;
            if (!createError) {
              const { data: fetchedCreated, error: fetchCreatedError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();
              if (!fetchCreatedError) {
                createdProfile = fetchedCreated as any;
              } else {
                console.warn('fetchUserProfile: Erro ao buscar perfil recém-criado:', fetchCreatedError);
              }
            }

            if (createError) {
              console.warn('fetchUserProfile: Falha ao criar perfil automaticamente:', {
                message: createError?.message,
                code: createError?.code,
                details: createError?.details,
                hint: createError?.hint
              });
              throw new Error('Perfil não encontrado ou erro na consulta');
            }

            profile = createdProfile as any;
            console.log('fetchUserProfile: Perfil criado automaticamente com sucesso');

            // Prosseguir com fluxo normal usando o perfil criado
            // (o restante do código abaixo montará o objeto UserProfile)
          } else {
            console.warn('fetchUserProfile: Não foi possível obter usuário autenticado para criar perfil');
            throw new Error('Perfil não encontrado ou erro na consulta');
          }
        } catch (createCatchError) {
          console.warn('fetchUserProfile: Erro na tentativa de criar perfil automaticamente', createCatchError);
          throw new Error('Perfil não encontrado ou erro na consulta');
        }
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
