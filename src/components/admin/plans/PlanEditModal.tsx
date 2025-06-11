
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';

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
  affiliate_link?: string;
}

interface PlanEditModalProps {
  plan: PlanConfiguration;
  onSave: (plan: PlanConfiguration) => void;
  onCancel: () => void;
}

const PlanEditModal: React.FC<PlanEditModalProps> = ({ plan, onSave, onCancel }) => {
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

          <div>
            <Label htmlFor="affiliate_link">Link de Afiliado (Cakto)</Label>
            <Input
              id="affiliate_link"
              type="url"
              placeholder="https://cakto.com.br/link-afiliado"
              value={editedPlan.affiliate_link || ''}
              onChange={(e) => setEditedPlan({...editedPlan, affiliate_link: e.target.value})}
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

export default PlanEditModal;
