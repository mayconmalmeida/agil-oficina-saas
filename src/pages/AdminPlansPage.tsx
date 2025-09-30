import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAdminManagement } from '@/hooks/admin/useAdminManagement';
import { PlanConfiguration } from '@/services/admin/adminService';

const AdminPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    plans,
    isLoading,
    error,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus
  } = useAdminManagement();

  const [editingPlan, setEditingPlan] = useState<PlanConfiguration | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    plan_type: 'essencial',
    billing_cycle: 'mensal',
    name: '',
    price: 0,
    currency: 'BRL',
    features: [] as string[],
    is_active: true,
    display_order: 0,
    affiliate_link: ''
  });

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleCreatePlan = async () => {
    try {
      await createPlan(formData);
      setIsCreating(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao criar plano:', error);
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;
    try {
      await updatePlan(editingPlan.id, formData);
      setEditingPlan(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        await deletePlan(id);
      } catch (error) {
        console.error('Erro ao excluir plano:', error);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await togglePlanStatus(id, !currentStatus);
    } catch (error) {
      console.error('Erro ao alterar status do plano:', error);
    }
  };

  const startCreating = () => {
    setIsCreating(true);
    resetForm();
  };

  const startEditing = (plan: PlanConfiguration) => {
    setEditingPlan(plan);
    setFormData({
      plan_type: plan.plan_type,
      billing_cycle: plan.billing_cycle,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      features: plan.features || [],
      is_active: plan.is_active,
      display_order: plan.display_order,
      affiliate_link: plan.affiliate_link || ''
    });
  };

  const resetForm = () => {
    setFormData({
      plan_type: 'essencial',
      billing_cycle: 'mensal',
      name: '',
      price: 0,
      currency: 'BRL',
      features: [],
      is_active: true,
      display_order: 0,
      affiliate_link: ''
    });
  };

  const cancelEditing = () => {
    setEditingPlan(null);
    setIsCreating(false);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando planos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg font-semibold mb-2">Erro ao carregar planos:</p>
        <p className="text-gray-600">{error}</p>
        <Button onClick={() => fetchPlans()} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Planos</h1>
            <p className="text-gray-600">Configure os planos disponíveis para as oficinas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              Voltar
            </Button>
            <Button onClick={startCreating}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Plano
            </Button>
          </div>
        </div>

        {/* Premium Monthly Registration Section */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Registro de Planos Premium Mensais Ativos</CardTitle>
            <CardDescription className="text-blue-600">
              Visualize e gerencie especificamente os planos Premium Mensais ativos no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plans
                .filter(plan => plan.plan_type === 'premium' && plan.billing_cycle === 'mensal' && plan.is_active)
                .map((plan) => (
                  <div key={plan.id} className="border border-blue-300 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-blue-800">{plan.name}</h3>
                          <Badge className="bg-blue-100 text-blue-800">Premium Mensal Ativo</Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-blue-600">
                          <span>Preço: R$ {plan.price.toFixed(2)}</span>
                          <span>Ordem: {plan.display_order}</span>
                          <span>Link: {plan.affiliate_link || 'Não configurado'}</span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <strong>Recursos:</strong> {plan.features?.join(', ') || 'Nenhum recurso configurado'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(plan)}
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              {plans.filter(plan => plan.plan_type === 'premium' && plan.billing_cycle === 'mensal' && plan.is_active).length === 0 && (
                <div className="text-center py-8 text-blue-600 bg-white rounded-lg border border-blue-200">
                  <p className="mb-4">Nenhum plano Premium Mensal ativo encontrado.</p>
                  <Button 
                    onClick={() => {
                      setFormData({
                        ...formData,
                        plan_type: 'premium',
                        billing_cycle: 'mensal',
                        name: 'Premium Mensal',
                        price: 197.90,
                        is_active: true
                      });
                      startCreating();
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Plano Premium Mensal
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plans List */}
        <Card>
          <CardHeader>
            <CardTitle>Todos os Planos Configurados</CardTitle>
            <CardDescription>
              Lista completa de todos os planos disponíveis no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{plan.name}</h3>
                        <Badge variant={plan.is_active ? "default" : "secondary"}>
                          {plan.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Mensal: R$ {plan.price_monthly ? plan.price_monthly.toFixed(2) : '0.00'}</span>
                        <span>Anual: R$ {plan.price_yearly ? plan.price_yearly.toFixed(2) : '0.00'}</span>
                        <span>Ordem: {plan.display_order}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(plan.id, plan.is_active)}
                      >
                        {plan.is_active ? (
                          <ToggleRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(plan)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {plans.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum plano configurado ainda.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        {(isCreating || editingPlan) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {isCreating ? 'Criar Novo Plano' : 'Editar Plano'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo do Plano</label>
                  <select
                    value={formData.plan_type}
                    onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="essencial">Essencial</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ciclo de Cobrança</label>
                  <select
                    value={formData.billing_cycle}
                    onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Plano</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Nome do plano"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Link de Afiliado/Checkout</label>
                  <input
                    type="url"
                    value={formData.affiliate_link}
                    onChange={(e) => setFormData({ ...formData, affiliate_link: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="https://checkout.exemplo.com/plano"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Recursos do Plano</label>
                  <textarea
                    value={formData.features.join('\n')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      features: e.target.value.split('\n').filter(f => f.trim()) 
                    })}
                    className="w-full border rounded-md px-3 py-2 h-32"
                    placeholder="Digite um recurso por linha"
                  />
                  <p className="text-xs text-gray-500 mt-1">Digite um recurso por linha</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ordem de Exibição</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">
                    Plano ativo
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={cancelEditing}>
                  Cancelar
                </Button>
                <Button onClick={isCreating ? handleCreatePlan : handleUpdatePlan}>
                  {isCreating ? 'Criar Plano' : 'Salvar Alterações'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPlansPage;
