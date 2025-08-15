
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Oficina {
  id: string;
  user_id: string;
  nome_oficina: string;
}

interface EditSubscriptionModalProps {
  subscription?: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isCreating?: boolean;
  oficinas: Oficina[];
}

const EditSubscriptionModal: React.FC<EditSubscriptionModalProps> = ({
  subscription,
  isOpen,
  onClose,
  onSuccess,
  isCreating = false,
  oficinas
}) => {
  const [formData, setFormData] = useState({
    user_id: '',
    plan_type: 'essencial_mensal',
    status: 'active',
    starts_at: new Date().toISOString().split('T')[0],
    ends_at: '',
    trial_ends_at: '',
    is_manual: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (subscription && !isCreating) {
      setFormData({
        user_id: subscription.user_id || '',
        plan_type: subscription.plan_type || 'essencial_mensal',
        status: subscription.status || 'active',
        starts_at: subscription.starts_at ? new Date(subscription.starts_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        ends_at: subscription.ends_at ? new Date(subscription.ends_at).toISOString().split('T')[0] : '',
        trial_ends_at: subscription.trial_ends_at ? new Date(subscription.trial_ends_at).toISOString().split('T')[0] : '',
        is_manual: subscription.is_manual !== false
      });
    } else if (isCreating) {
      setFormData({
        user_id: '',
        plan_type: 'essencial_mensal',
        status: 'active',
        starts_at: new Date().toISOString().split('T')[0],
        ends_at: '',
        trial_ends_at: '',
        is_manual: true
      });
    }
  }, [subscription, isCreating, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.user_id) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Selecione uma oficina."
        });
        return;
      }

      // Calcular data de fim baseada no tipo de plano se não fornecida
      let calculatedEndDate = formData.ends_at;
      if (!calculatedEndDate) {
        const startDate = new Date(formData.starts_at);
        if (formData.plan_type.includes('_anual')) {
          startDate.setFullYear(startDate.getFullYear() + 1);
        } else {
          startDate.setMonth(startDate.getMonth() + 1);
        }
        calculatedEndDate = startDate.toISOString().split('T')[0];
      }

      const subscriptionData = {
        user_id: formData.user_id,
        plan_type: formData.plan_type,
        status: formData.status,
        starts_at: new Date(formData.starts_at + 'T00:00:00.000Z').toISOString(),
        ends_at: new Date(calculatedEndDate + 'T23:59:59.999Z').toISOString(),
        trial_ends_at: formData.trial_ends_at ? new Date(formData.trial_ends_at + 'T23:59:59.999Z').toISOString() : null,
        is_manual: formData.is_manual,
        updated_at: new Date().toISOString()
      };

      console.log('Salvando assinatura:', subscriptionData);

      if (isCreating) {
        const { error } = await supabase
          .from('user_subscriptions')
          .insert([subscriptionData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Assinatura criada com sucesso."
        });
      } else {
        const { error } = await supabase
          .from('user_subscriptions')
          .update(subscriptionData)
          .eq('id', subscription.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Assinatura atualizada com sucesso."
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Erro ao salvar assinatura:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível salvar a assinatura."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Nova Assinatura' : 'Editar Assinatura'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="oficina">Oficina *</Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, user_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma oficina" />
                </SelectTrigger>
                <SelectContent>
                  {oficinas.map((oficina) => (
                    <SelectItem key={oficina.user_id} value={oficina.user_id}>
                      {oficina.nome_oficina || 'Nome não informado'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan_type">Tipo de Plano *</Label>
              <Select
                value={formData.plan_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, plan_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essencial_mensal">Essencial Mensal</SelectItem>
                  <SelectItem value="essencial_anual">Essencial Anual</SelectItem>
                  <SelectItem value="premium_mensal">Premium Mensal</SelectItem>
                  <SelectItem value="premium_anual">Premium Anual</SelectItem>
                  <SelectItem value="free_trial_essencial">Trial Essencial</SelectItem>
                  <SelectItem value="free_trial_premium">Trial Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="trialing">Em Teste</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="starts_at">Data de Início *</Label>
              <Input
                id="starts_at"
                type="date"
                value={formData.starts_at}
                onChange={(e) => setFormData(prev => ({ ...prev, starts_at: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ends_at">Data de Fim</Label>
              <Input
                id="ends_at"
                type="date"
                value={formData.ends_at}
                onChange={(e) => setFormData(prev => ({ ...prev, ends_at: e.target.value }))}
              />
              <p className="text-xs text-gray-500">Se vazio, será calculado automaticamente</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trial_ends_at">Fim do Trial</Label>
              <Input
                id="trial_ends_at"
                type="date"
                value={formData.trial_ends_at}
                onChange={(e) => setFormData(prev => ({ ...prev, trial_ends_at: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : (isCreating ? 'Criar' : 'Salvar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubscriptionModal;
