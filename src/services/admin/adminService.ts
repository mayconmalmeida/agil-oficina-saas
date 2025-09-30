import { supabase } from '@/lib/supabase';
import { AdminUser, AdminStats } from '@/types/admin';

export interface AdminRecord {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'superadmin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface Workshop {
  id: string;
  user_id: string;
  nome_oficina: string | null;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  responsavel: string | null;
  is_active: boolean | null;
  created_at: string | null;
  trial_ends_at: string | null;
  plano: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  subscription_status?: string;
  subscription?: {
    id: string;
    plan_type: string;
    status: string;
    starts_at: string;
    ends_at: string | null;
  } | null;
}

export interface PlanConfiguration {
  id: string;
  plan_type: string;
  billing_cycle: string;
  name: string;
  description?: string;
  price: number;
  price_monthly?: number;
  price_yearly?: number;
  currency: string;
  features: string[];
  is_active: boolean;
  display_order: number;
  affiliate_link?: string;
  checkout_link_monthly?: string;
  checkout_link_yearly?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  starts_at: string;
  ends_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
  is_manual: boolean;
  user_email?: string;
  nome_oficina?: string;
}

export interface GlobalConfiguration {
  id: string;
  key: string;
  value: string;
  description?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class AdminService {
  // ===== ADMIN MANAGEMENT =====
  async getAllAdmins(): Promise<AdminRecord[]> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Erro ao buscar administradores: ${error.message}`);
    return (data || []).map(admin => ({
      ...admin,
      role: admin.role as 'admin' | 'superadmin'
    }));
  }

  async createAdmin(adminData: {
    email: string;
    password_hash: string;
    role: 'admin' | 'superadmin';
  }): Promise<AdminRecord> {
    const { data, error } = await supabase
      .from('admins')
      .insert([adminData])
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar administrador: ${error.message}`);
    return {
      ...data,
      role: data.role as 'admin' | 'superadmin'
    };
  }

  async updateAdmin(id: string, updates: Partial<AdminRecord>): Promise<AdminRecord> {
    const { data, error } = await supabase
      .from('admins')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar administrador: ${error.message}`);
    return {
      ...data,
      role: data.role as 'admin' | 'superadmin'
    };
  }

  async deleteAdmin(id: string): Promise<void> {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Erro ao deletar administrador: ${error.message}`);
  }

  // ===== WORKSHOP MANAGEMENT =====
  async getAllWorkshops(): Promise<Workshop[]> {
    // Fetch workshop data from profiles table instead of oficinas table (incluindo email)
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id,
        created_at,
        nome_oficina,
        cnpj,
        telefone,
        email,
        responsavel,
        endereco,
        cidade,
        estado,
        cep,
        plano,
        is_active
      `)
      .not('nome_oficina', 'is', null) // Only get profiles that have workshop names
      .order('created_at', { ascending: false });

    if (profilesError) throw new Error(`Erro ao buscar oficinas: ${profilesError.message}`);

    // Buscar assinaturas para cada oficina
    const { data: subscriptionsData, error: subscriptionsError } = await supabase
      .from('user_subscriptions')
      .select('*');

    if (subscriptionsError) throw new Error(`Erro ao buscar assinaturas: ${subscriptionsError.message}`);

    // Mapear assinaturas por user_id
    const subscriptionMap = new Map();
    subscriptionsData?.forEach(sub => {
      subscriptionMap.set(sub.user_id, sub);
    });

    // Transform profiles data to match Workshop interface
    return (profilesData || []).map(profile => ({
      id: profile.id,
      user_id: profile.id, // In profiles table, id is the user_id
      nome_oficina: profile.nome_oficina,
      cnpj: profile.cnpj,
      telefone: profile.telefone,
      email: profile.email || null,
      responsavel: profile.responsavel,
      endereco: profile.endereco,
      cidade: profile.cidade,
      estado: profile.estado,
      cep: profile.cep,
      is_active: profile.is_active ?? true, // Default to true if null
      created_at: profile.created_at,
      trial_ends_at: null, // Not available in profiles
      plano: profile.plano,
      subscription_status: subscriptionMap.get(profile.id)?.status || 'inactive',
      subscription: subscriptionMap.get(profile.id) || null
    }));
  }

  async updateWorkshop(id: string, updates: Partial<Workshop>): Promise<Workshop> {
    // Update workshop data in profiles table instead of oficinas table
    const { data, error } = await supabase
      .from('profiles')
      .update({
        nome_oficina: updates.nome_oficina,
        cnpj: updates.cnpj,
        telefone: updates.telefone,
        responsavel: updates.responsavel,
        endereco: updates.endereco,
        cidade: updates.cidade,
        estado: updates.estado,
        cep: updates.cep
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar oficina: ${error.message}`);
    
    // Transform the profile data back to Workshop format
    return {
      id: data.id,
      user_id: data.id,
      nome_oficina: data.nome_oficina,
      cnpj: data.cnpj,
      telefone: data.telefone,
      email: null, // Will be populated by getAllWorkshops if needed
      responsavel: data.responsavel,
      endereco: data.endereco,
      cidade: data.cidade,
      estado: data.estado,
      cep: data.cep,
      is_active: true,
      created_at: data.created_at,
      trial_ends_at: null,
      plano: data.plano,
      subscription_status: 'inactive'
    };
  }

  async blockWorkshop(id: string): Promise<void> {
    // Since profiles table doesn't have is_active field, we'll add it
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw new Error(`Erro ao bloquear oficina: ${error.message}`);
  }

  async unblockWorkshop(id: string): Promise<void> {
    // Since profiles table doesn't have is_active field, we'll add it
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: true })
      .eq('id', id);
    
    if (error) throw new Error(`Erro ao desbloquear oficina: ${error.message}`);
  }

  // ===== PLAN MANAGEMENT =====
  async getAllPlans(): Promise<PlanConfiguration[]> {
    const { data, error } = await supabase
      .from('plan_configurations')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw new Error(`Erro ao buscar planos: ${error.message}`);
    return (data || []).map(plan => ({
      ...plan,
      features: Array.isArray(plan.features) ? plan.features : JSON.parse(String(plan.features || '[]'))
    }));
  }

  async createPlan(planData: Omit<PlanConfiguration, 'id' | 'created_at' | 'updated_at'>): Promise<PlanConfiguration> {
    const { data, error } = await supabase
      .from('plan_configurations')
      .insert([planData])
      .select();

    if (error) throw new Error(`Erro ao criar plano: ${error.message}`);
    if (!data || data.length === 0) throw new Error('Falha ao criar plano');
    
    const createdPlan = data[0];
    return {
      ...createdPlan,
      features: Array.isArray(createdPlan.features) ? createdPlan.features : JSON.parse(String(createdPlan.features || '[]'))
    };
  }

  async updatePlan(id: string, updates: Partial<PlanConfiguration>): Promise<PlanConfiguration> {
    const { data, error } = await supabase
      .from('plan_configurations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) throw new Error(`Erro ao atualizar plano: ${error.message}`);
    if (!data || data.length === 0) throw new Error('Plano não encontrado para atualização');
    if (data.length > 1) throw new Error('Múltiplos planos encontrados com o mesmo ID');
    
    const updatedPlan = data[0];
    return {
      ...updatedPlan,
      features: Array.isArray(updatedPlan.features) ? updatedPlan.features : JSON.parse(String(updatedPlan.features || '[]'))
    };
  }

  async deletePlan(id: string): Promise<void> {
    const { error } = await supabase
      .from('plan_configurations')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Erro ao deletar plano: ${error.message}`);
  }

  async togglePlanStatus(id: string, isActive: boolean): Promise<PlanConfiguration> {
    return this.updatePlan(id, { is_active: isActive });
  }

  // ===== SUBSCRIPTION MANAGEMENT =====
  async getAllSubscriptions(): Promise<Subscription[]> {
    // First get all subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (subError) throw new Error(`Erro ao buscar assinaturas: ${subError.message}`);

    if (!subscriptions || subscriptions.length === 0) {
      return [];
    }

    // Get user IDs from subscriptions
    const userIds = subscriptions.map(sub => sub.user_id);

    // Get profiles for these users
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, nome_oficina')
      .in('id', userIds);

    if (profileError) throw new Error(`Erro ao buscar perfis: ${profileError.message}`);

    // Create a map of profiles by user_id for quick lookup
    const profileMap = new Map();
    (profiles || []).forEach(profile => {
      profileMap.set(profile.id, profile);
    });

    // Combine subscriptions with profile data
    return subscriptions.map((sub: any) => {
      const profile = profileMap.get(sub.user_id);
      return {
        ...sub,
        user_email: profile?.email || '',
        nome_oficina: profile?.nome_oficina || ''
      };
    });
  }

  async updateSubscriptionStatus(id: string, status: 'active' | 'cancelled' | 'expired' | 'trialing'): Promise<Subscription> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar status da assinatura: ${error.message}`);
    return data;
  }

  async createManualSubscription(subscriptionData: {
    user_id: string;
    plan_type: string;
    status: string;
    starts_at: string;
    ends_at?: string;
  }): Promise<Subscription> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert([{ ...subscriptionData, is_manual: true }])
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar assinatura manual: ${error.message}`);
    return data;
  }

  // ===== GLOBAL CONFIGURATIONS =====
  async getGlobalConfigurations(): Promise<GlobalConfiguration[]> {
    try {
      console.log('🔍 AdminService: Buscando configurações globais...');
      
      const { data, error } = await supabase
        .from('global_configurations')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar configurações globais:', error);
        
        // Se a tabela não existe, retorna configurações padrão
        if (error.message.includes('relation "public.global_configurations" does not exist')) {
          console.log('⚠️ Tabela global_configurations não existe, retornando configurações padrão');
          return [
            {
              id: 'default-1',
              key: 'checkout_link_mensal',
              value: 'https://checkout.cackto.com.br/premium/mensal',
              description: 'Link de checkout para plano mensal',
              category: 'checkout',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'default-2',
              key: 'checkout_link_anual',
              value: 'https://checkout.cackto.com.br/premium/anual',
              description: 'Link de checkout para plano anual',
              category: 'checkout',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'default-3',
              key: 'whatsapp_support',
              value: '+5546999324779',
              description: 'Número do WhatsApp de suporte',
              category: 'whatsapp',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'default-4',
              key: 'welcome_message',
              value: 'Bem-vindo ao OficinaGo! Estamos aqui para ajudar você a gerenciar sua oficina de forma eficiente.',
              description: 'Mensagem de boas-vindas automática',
              category: 'messages',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
        }
        
        throw error;
      }

      console.log('✅ AdminService: Configurações globais encontradas:', data?.length || 0);
      return data || [];
    } catch (error: any) {
      console.error('❌ AdminService: Erro ao buscar configurações globais:', error);
      throw new Error(`Erro ao buscar configurações globais: ${error.message}`);
    }
  }

  async updateGlobalConfiguration(id: string, value: string): Promise<GlobalConfiguration> {
    try {
      console.log('🔄 AdminService: Atualizando configuração global:', { id, value });
      
      const { data, error } = await supabase
        .from('global_configurations')
        .update({ 
          value,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar configuração global:', error);
        throw error;
      }

      console.log('✅ AdminService: Configuração global atualizada:', data);
      return data;
    } catch (error: any) {
      console.error('❌ AdminService: Erro ao atualizar configuração global:', error);
      throw new Error(`Erro ao atualizar configuração global: ${error?.message || 'Erro desconhecido'}`);
    }
  }

  async createGlobalConfiguration(configData: Omit<GlobalConfiguration, 'id' | 'created_at' | 'updated_at'>): Promise<GlobalConfiguration> {
    try {
      console.log('➕ AdminService: Criando nova configuração global:', configData);
      
      const { data, error } = await supabase
        .from('global_configurations')
        .insert([configData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar configuração global:', error);
        throw error;
      }

      console.log('✅ AdminService: Configuração global criada:', data);
      return data;
    } catch (error: any) {
      console.error('❌ AdminService: Erro ao criar configuração global:', error);
      throw new Error(`Erro ao criar configuração global: ${error.message}`);
    }
  }

  async deleteGlobalConfiguration(id: string): Promise<void> {
    try {
      console.log('🗑️ AdminService: Deletando configuração global:', id);
      
      const { error } = await supabase
        .from('global_configurations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao deletar configuração global:', error);
        throw error;
      }

      console.log('✅ AdminService: Configuração global deletada');
    } catch (error: any) {
      console.error('❌ AdminService: Erro ao deletar configuração global:', error);
      throw new Error(`Erro ao deletar configuração global: ${error.message}`);
    }
  }

  // ===== STATISTICS =====
  async getAdminStats(): Promise<AdminStats> {
    try {
      console.log('🔍 AdminService: Buscando estatísticas via RPC...');
      
      // Usar a função RPC do banco para buscar estatísticas
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_admin_stats');

      if (statsError) {
        console.error('❌ Erro ao buscar estatísticas via RPC:', statsError);
        throw statsError;
      }

      console.log('📊 AdminService: Estatísticas recebidas do banco:', statsData);

      // Verificar se statsData é um objeto válido
      if (typeof statsData === 'object' && statsData !== null && !Array.isArray(statsData)) {
        const stats: AdminStats = {
          totalOficinas: Number(statsData.totalOficinas) || 0,
          activeSubscriptions: Number(statsData.activeSubscriptions) || 0,
          trialingUsers: Number(statsData.trialingUsers) || 0,
          totalRevenue: Number(statsData.totalRevenue) || 0,
          newUsersThisMonth: Number(statsData.newUsersThisMonth) || 0,
        };

        console.log('✅ AdminService: Estatísticas processadas:', stats);
        return stats;
      } else {
        console.warn('⚠️ AdminService: Dados de estatística inválidos, retornando zeros');
        return {
          totalOficinas: 0,
          activeSubscriptions: 0,
          trialingUsers: 0,
          totalRevenue: 0,
          newUsersThisMonth: 0
        };
      }
    } catch (error: any) {
      console.error('❌ AdminService: Erro ao buscar estatísticas:', error);
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }
  }
}

export const adminService = new AdminService();