
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, RefreshCw, Calendar, User, CreditCard } from 'lucide-react';
import { useAdminManagement } from '@/hooks/admin/useAdminManagement';
import { Subscription } from '@/services/admin/adminService';

const AdminSubscriptions = () => {
  const navigate = useNavigate();
  const {
    subscriptions,
    workshops,
    isLoading,
    error,
    fetchSubscriptions,
    fetchWorkshops,
    updateSubscriptionStatus,
    createManualSubscription
  } = useAdminManagement();

  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    plan_type: 'premium_mensal',
    status: 'active' as 'active' | 'cancelled' | 'expired' | 'trialing',
    starts_at: new Date().toISOString().split('T')[0],
    ends_at: ''
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchWorkshops();
  }, [fetchSubscriptions, fetchWorkshops]);

  const handleCreateSubscription = async () => {
    try {
      await createManualSubscription(formData);
      setIsCreating(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'active' | 'cancelled' | 'expired' | 'trialing') => {
    try {
      await updateSubscriptionStatus(id, newStatus);
    } catch (error) {
      console.error('Erro ao alterar status da assinatura:', error);
    }
  };

  const startCreating = () => {
    setIsCreating(true);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      plan_type: 'premium_mensal',
      status: 'active',
      starts_at: new Date().toISOString().split('T')[0],
      ends_at: ''
    });
  };

  const cancelEditing = () => {
    setEditingSubscription(null);
    setIsCreating(false);
    resetForm();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativa', variant: 'default' as const },
      trialing: { label: 'Trial', variant: 'secondary' as const },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const },
      expired: { label: 'Expirada', variant: 'outline' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getWorkshopName = (userId: string) => {
    const workshop = workshops.find(w => w.user_id === userId);
    return workshop?.nome_oficina || 'Oficina não encontrada';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateDaysRemaining = (sub: Subscription) => {
    const now = new Date();
    let end: Date | null = sub.ends_at ? new Date(sub.ends_at) : null;
    if (!end && sub.starts_at) {
      const s = new Date(sub.starts_at);
      end = new Date(s);
      end.setMonth(end.getMonth() + 1);
    }
    if (!end) return null;
    const diffMs = end.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const getRenewalBadge = (days: number | null) => {
    if (days === null) return null;
    if (days <= 0) return <Badge variant="destructive">Vencida</Badge>;
    if (days <= 3) return <Badge variant="destructive">Renova em {days}d</Badge>;
    if (days <= 7) return <Badge variant="secondary">Renova em {days}d</Badge>;
    return <Badge variant="outline">Renova em {days}d</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando assinaturas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg font-semibold mb-2">Erro ao carregar assinaturas:</p>
        <p className="text-gray-600">{error}</p>
        <Button onClick={() => fetchSubscriptions()} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Assinaturas</h1>
            <p className="text-gray-600">Visualize e gerencie todas as assinaturas do sistema</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              Voltar
            </Button>
            <Button variant="outline" onClick={() => fetchSubscriptions()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/webhook-asaas')}>
              Webhook Asaas
            </Button>
            <Button onClick={startCreating}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Assinatura
            </Button>
          </div>
        </div>

        {/* Subscriptions List */}
        <Card>
          <CardHeader>
            <CardTitle>Assinaturas Ativas</CardTitle>
            <CardDescription>
              Lista de todas as assinaturas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptions.map((subscription) => {
                const daysRemaining = calculateDaysRemaining(subscription);
                return (
                  <div key={subscription.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <h3 className="text-lg font-semibold">{getWorkshopName(subscription.user_id)}</h3>
                          {getStatusBadge(subscription.status)}
                          {getRenewalBadge(daysRemaining)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <span>Plano: {subscription.plan_type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Início: {formatDate(subscription.starts_at)}</span>
                          </div>
                          {subscription.ends_at && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Fim: {formatDate(subscription.ends_at)}</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-400">
                            ID: {subscription.id.slice(0, 8)}...
                          </div>
                          {subscription.user_email && (
                            <div className="text-xs text-gray-400">
                              {subscription.user_email}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={subscription.status}
                          onChange={(e) => handleStatusChange(subscription.id, e.target.value as any)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="active">Ativa</option>
                          <option value="trialing">Trial</option>
                          <option value="cancelled">Cancelada</option>
                          <option value="expired">Expirada</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
              {subscriptions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma assinatura encontrada.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Manual Subscription Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Criar Assinatura Manual</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Oficina</label>
                  <select
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Selecione uma oficina</option>
                    {workshops.map((workshop) => (
                      <option key={workshop.id} value={workshop.user_id}>
                        {workshop.nome_oficina || 'Oficina sem nome'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Plano</label>
                  <select
                    value={formData.plan_type}
                    onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="premium_mensal">Premium Mensal</option>
                    <option value="premium_anual">Premium Anual</option>
                    <option value="free_trial_premium">Trial Premium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="active">Ativa</option>
                    <option value="trialing">Trial</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="expired">Expirada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={formData.starts_at}
                    onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Data de Fim (opcional)</label>
                  <input
                    type="date"
                    value={formData.ends_at}
                    onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={cancelEditing}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateSubscription}>
                  Criar Assinatura
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptions;
