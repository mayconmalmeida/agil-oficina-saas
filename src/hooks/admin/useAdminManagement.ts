import React, { useState, useCallback } from 'react';
import { adminService, AdminRecord, Workshop, PlanConfiguration, Subscription, GlobalConfiguration } from '@/services/admin/adminService';
import { AdminStats } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';

export const useAdminManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // ===== ADMIN MANAGEMENT =====
  const [admins, setAdmins] = useState<AdminRecord[]>([]);

  const fetchAdmins = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getAllAdmins();
      setAdmins(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createAdmin = useCallback(async (adminData: {
    email: string;
    password_hash: string;
    role: 'admin' | 'superadmin';
  }) => {
    try {
      setIsLoading(true);
      const newAdmin = await adminService.createAdmin(adminData);
      setAdmins(prev => [newAdmin, ...prev]);
      toast({
        title: "Sucesso",
        description: "Administrador criado com sucesso"
      });
      return newAdmin;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateAdmin = useCallback(async (id: string, updates: Partial<AdminRecord>) => {
    try {
      setIsLoading(true);
      const updatedAdmin = await adminService.updateAdmin(id, updates);
      setAdmins(prev => prev.map(admin => admin.id === id ? updatedAdmin : admin));
      toast({
        title: "Sucesso",
        description: "Administrador atualizado com sucesso"
      });
      return updatedAdmin;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteAdmin = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      await adminService.deleteAdmin(id);
      setAdmins(prev => prev.filter(admin => admin.id !== id));
      toast({
        title: "Sucesso",
        description: "Administrador removido com sucesso"
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // ===== WORKSHOP MANAGEMENT =====
  const [workshops, setWorkshops] = useState<Workshop[]>([]);

  const fetchWorkshops = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getAllWorkshops();
      setWorkshops(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateWorkshop = useCallback(async (id: string, updates: Partial<Workshop>) => {
    try {
      setIsLoading(true);
      const updatedWorkshop = await adminService.updateWorkshop(id, updates);
      setWorkshops(prev => prev.map(workshop => workshop.id === id ? updatedWorkshop : workshop));
      toast({
        title: "Sucesso",
        description: "Oficina atualizada com sucesso"
      });
      return updatedWorkshop;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const blockWorkshop = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      await adminService.blockWorkshop(id);
      setWorkshops(prev => prev.map(workshop => 
        workshop.id === id ? { ...workshop, is_active: false } : workshop
      ));
      toast({
        title: "Sucesso",
        description: "Oficina bloqueada com sucesso"
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const unblockWorkshop = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      await adminService.unblockWorkshop(id);
      setWorkshops(prev => prev.map(workshop => 
        workshop.id === id ? { ...workshop, is_active: true } : workshop
      ));
      toast({
        title: "Sucesso",
        description: "Oficina desbloqueada com sucesso"
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // ===== PLAN MANAGEMENT =====
  const [plans, setPlans] = useState<PlanConfiguration[]>([]);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getAllPlans();
      setPlans(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createPlan = useCallback(async (planData: Omit<PlanConfiguration, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsLoading(true);
      const newPlan = await adminService.createPlan(planData);
      setPlans(prev => [...prev, newPlan]);
      toast({
        title: "Sucesso",
        description: "Plano criado com sucesso"
      });
      return newPlan;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updatePlan = useCallback(async (id: string, updates: Partial<PlanConfiguration>) => {
    try {
      setIsLoading(true);
      const updatedPlan = await adminService.updatePlan(id, updates);
      setPlans(prev => prev.map(plan => plan.id === id ? updatedPlan : plan));
      toast({
        title: "Sucesso",
        description: "Plano atualizado com sucesso"
      });
      return updatedPlan;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deletePlan = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      await adminService.deletePlan(id);
      setPlans(prev => prev.filter(plan => plan.id !== id));
      toast({
        title: "Sucesso",
        description: "Plano removido com sucesso"
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const togglePlanStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      setIsLoading(true);
      const updatedPlan = await adminService.togglePlanStatus(id, isActive);
      setPlans(prev => prev.map(plan => plan.id === id ? updatedPlan : plan));
      toast({
        title: "Sucesso",
        description: `Plano ${isActive ? 'ativado' : 'desativado'} com sucesso`
      });
      return updatedPlan;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // ===== SUBSCRIPTION MANAGEMENT =====
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getAllSubscriptions();
      setSubscriptions(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateSubscriptionStatus = useCallback(async (id: string, status: 'active' | 'cancelled' | 'expired' | 'trialing') => {
    try {
      setIsLoading(true);
      const updatedSubscription = await adminService.updateSubscriptionStatus(id, status);
      setSubscriptions(prev => prev.map(sub => sub.id === id ? updatedSubscription : sub));
      toast({
        title: "Sucesso",
        description: "Status da assinatura atualizado com sucesso"
      });
      return updatedSubscription;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createManualSubscription = useCallback(async (subscriptionData: {
    user_id: string;
    plan_type: string;
    status: string;
    starts_at: string;
    ends_at?: string;
  }) => {
    try {
      setIsLoading(true);
      const newSubscription = await adminService.createManualSubscription(subscriptionData);
      setSubscriptions(prev => [newSubscription, ...prev]);
      toast({
        title: "Sucesso",
        description: "Assinatura manual criada com sucesso"
      });
      return newSubscription;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // ===== GLOBAL CONFIGURATIONS =====
  const [configurations, setConfigurations] = useState<GlobalConfiguration[]>([]);

  const fetchConfigurations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getGlobalConfigurations();
      setConfigurations(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateConfiguration = useCallback(async (id: string, value: string) => {
    try {
      setIsLoading(true);
      const updatedConfig = await adminService.updateGlobalConfiguration(id, value);
      setConfigurations(prev => prev.map(config => 
        config.id === id ? updatedConfig : config
      ));
      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso"
      });
      return updatedConfig;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // ===== STATISTICS =====
  const [stats, setStats] = useState<AdminStats>({
    totalOficinas: 0,
    activeSubscriptions: 0,
    trialingUsers: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0
  });

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getAdminStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    // State
    isLoading,
    error,
    admins,
    workshops,
    plans,
    subscriptions,
    configurations,
    stats,

    // Admin Management
    fetchAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,

    // Workshop Management
    fetchWorkshops,
    updateWorkshop,
    blockWorkshop,
    unblockWorkshop,

    // Plan Management
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus,

    // Subscription Management
    fetchSubscriptions,
    updateSubscriptionStatus,
    createManualSubscription,

    // Global Configurations
    fetchConfigurations,
    updateConfiguration,

    // Statistics
    fetchStats
  };
};