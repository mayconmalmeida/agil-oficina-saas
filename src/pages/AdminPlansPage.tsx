
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit2, Plus, Save, X } from 'lucide-react';

interface PlanConfiguration {
  id: string;
  plan_type: string;
  billing_cycle: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  is_active: boolean;
  display_order: number;
}

const AdminPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<PlanConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<PlanConfiguration | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plan_configurations')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os planos."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async (plan: PlanConfiguration) => {
    try {
      const { error } = await supabase
        .from('plan_configurations')
        .upsert({
          id: plan.id === 'new' ? undefined : plan.id,
          plan_type: plan.plan_type,
          billing_cycle: plan.billing_cycle,
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
          features: plan.features,
          is_active: plan.is_active,
          display_order: plan.display_order
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Plano salvo com sucesso!"
      });

      setEditingPlan(null);
      setIsCreating(false);
      fetchPlans();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar o plano."
      });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;

    try {
      const { error } = await supabase
        .from('plan_configurations')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Plano excluído com sucesso!"
      });

      fetchPlans();
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o plano."
      });
    }
  };

  const startCreating = () => {
    setEditingPlan({
      id: 'new',
      plan_type: 'essencial',
      billing_cycle: 'mensal',
      name: '',
      price: 0,
      currency: 'BRL',
      features: [],
      is_active: true,
      display_order: plans.length + 1
    });
    setIsCreating(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando planos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciar Planos
          </h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Configurações dos Planos</CardTitle>
                  <CardDescription>
                    Gerencie os planos que aparecem na página inicial
                  </CardDescription>
                </div>
                <Button onClick={startCreating}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Plano
                </Button>
              </div>
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
            onCancel={() => {
              setEditingPlan(null);
              setIsCreating(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

const PlanCard: React.FC<{
  plan: PlanConfiguration;
  onEdit: (plan: PlanConfiguration) => void;
  onDelete: (planId: string) => void;
}> = ({ plan, onEdit, onDelete }) => {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{plan.name}</h3>
            <Badge variant={plan.is_active ? "default" : "secondary"}>
              {plan.is_active ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            {plan.plan_type} - {plan.billing_cycle}
          </p>
          <p className="text-lg font-bold text-green-600">
            R$ {plan.price.toFixed(2)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(plan)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => onDelete(plan.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <strong>Recursos:</strong> {plan.features.join(', ')}
      </div>
    </div>
  );
};

const PlanEditModal: React.FC<{
  plan: PlanConfiguration;
  onSave: (plan: PlanConfiguration) => void;
  onCancel: () => void;
}> = ({ plan, onSave, onCancel }) => {
  const [editedPlan, setEditedPlan] = useState(plan);
  const [featuresText, setFeaturesText] = useState(plan.features.join('\n'));

  const handleSave = () => {
    const features = featuresText.split('\n').filter(f => f.trim());
    onSave({
      ...editedPlan,
      features
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {plan.id === 'new' ? 'Criar Novo Plano' : 'Editar Plano'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plan_type">Tipo do Plano</Label>
              <Select
                value={editedPlan.plan_type}
                onValueChange={(value) => setEditedPlan({...editedPlan, plan_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essencial">Essencial</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="billing_cycle">Ciclo de Cobrança</Label>
              <Select
                value={editedPlan.billing_cycle}
                onValueChange={(value) => setEditedPlan({...editedPlan, billing_cycle: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="name">Nome do Plano</Label>
            <Input
              id="name"
              value={editedPlan.name}
              onChange={(e) => setEditedPlan({...editedPlan, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={editedPlan.price}
                onChange={(e) => setEditedPlan({...editedPlan, price: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="display_order">Ordem de Exibição</Label>
              <Input
                id="display_order"
                type="number"
                value={editedPlan.display_order}
                onChange={(e) => setEditedPlan({...editedPlan, display_order: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="features">Recursos (um por linha)</Label>
            <Textarea
              id="features"
              rows={6}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder="Digite um recurso por linha"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={editedPlan.is_active}
              onCheckedChange={(checked) => setEditedPlan({...editedPlan, is_active: checked})}
            />
            <Label>Plano Ativo</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPlansPage;
