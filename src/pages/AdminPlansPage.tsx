import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PlansHeader from '@/components/admin/plans/PlansHeader';
import PlanCard from '@/components/admin/plans/PlanCard';
import PlanEditModal from '@/components/admin/plans/PlanEditModal';
import { usePlansManagement } from '@/hooks/admin/usePlansManagement';

const AdminPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    plans,
    loading,
    error,
    editingPlan,
    isCreating,
    fetchPlans,
    handleSavePlan,
    handleDeletePlan,
    startCreating,
    cancelEditing,
    setEditingPlan
  } = usePlansManagement();

  // Adiciona uma área de debug para mostrar informação crua da consulta Supabase
  const [rawData, setRawData] = React.useState<any>(null);

  React.useEffect(() => {
    // Função para buscar dados e mostrar o resultado cru na tela
    const debugFetch = async () => {
      const { data, error } = await import("@/integrations/supabase/client").then(m =>
        m.supabase.from('plan_configurations').select('*').order('display_order')
      );
      setRawData({ data, error });
      if (error) {
        console.error("[DEBUG] Supabase error:", error);
      } else {
        console.log("[DEBUG] Supabase raw data:", data);
      }
    };
    debugFetch();
    fetchPlans();
  }, [fetchPlans]);

  if (loading) {
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
        <button 
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => fetchPlans()}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <PlansHeader 
          onBack={() => navigate('/admin')}
          onCreateNew={startCreating}
        />

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações dos Planos</CardTitle>
              <CardDescription>
                Gerencie os planos que aparecem na página inicial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onEdit={setEditingPlan}
                    onDelete={handleDeletePlan}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {(editingPlan || isCreating) && (
          <PlanEditModal
            plan={editingPlan!}
            onSave={handleSavePlan}
            onCancel={cancelEditing}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPlansPage;
