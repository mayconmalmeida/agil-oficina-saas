
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface EditSubscriptionModalProps {
  subscription?: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isCreating: boolean;
  oficinas: any[];
}

const EditSubscriptionModal: React.FC<EditSubscriptionModalProps> = ({
  subscription,
  isOpen,
  onClose,
  onSuccess,
  isCreating,
  oficinas
}) => {
  const [formData, setFormData] = useState({
    user_id: '',
    plan_type: '',
    status: 'active',
    starts_at: '',
    ends_at: '',
    oficina_id: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subscription && !isCreating) {
      setFormData({
        user_id: subscription.user_id || '',
        plan_type: subscription.plan_type || '',
        status: subscription.status || 'active',
        starts_at: subscription.starts_at ? subscription.starts_at.split('T')[0] : '',
        ends_at: subscription.ends_at ? subscription.ends_at.split('T')[0] : '',
        oficina_id: subscription.oficina_id || ''
      });
    } else {
      setFormData({
        user_id: '',
        plan_type: '',
        status: 'active',
        starts_at: new Date().toISOString().split('T')[0],
        ends_at: '',
        oficina_id: ''
      });
    }
  }, [subscription, isCreating, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Encontrar a oficina selecionada
      const selectedOficina = oficinas.find(o => o.user_id === formData.user_id);
      
      if (!selectedOficina) {
        toast({
          title: "Erro",
          description: "Oficina não encontrada para o usuário selecionado",
          variant: "destructive"
        });
        return;
      }

      const subscriptionData = {
        user_id: formData.user_id,
        plan_type: formData.plan_type,
        status: formData.status,
        starts_at: formData.starts_at,
        ends_at: formData.ends_at,
        is_manual: true
      };

      let result;
      if (isCreating) {
        result = await supabase
          .from('user_subscriptions')
          .insert([subscriptionData]);
      } else {
        result = await supabase
          .from('user_subscriptions')
          .update(subscriptionData)
          .eq('id', subscription.id);
      }

      if (result.error) throw result.error;

      // ✅ Atualizar também a tabela oficinas com os dados corretos
      const planType = formData.plan_type.includes('premium') ? 'Premium' : 'Essencial';
      
      console.log('Atualizando oficina:', {
        oficinaId: selectedOficina.id,
        planType,
        trialEndsAt: formData.ends_at
      });

      const { error: oficinaError } = await supabase
        .from('oficinas')
        .update({
          plano: planType,
          trial_ends_at: formData.ends_at
        })
        .eq('id', selectedOficina.id);

      if (oficinaError) {
        console.error('Erro ao atualizar oficina:', oficinaError);
        toast({
          title: "Aviso",
          description: "Assinatura criada, mas houve erro ao atualizar a oficina",
          variant: "destructive"
        });
      } else {
        console.log('Oficina atualizada com sucesso');
        toast({
          title: "Sucesso",
          description: `Assinatura ${isCreating ? 'criada' : 'atualizada'} com sucesso. Oficina também foi atualizada.`
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar assinatura:', error);
      toast({
        title: "Erro",
        description: `Erro ao ${isCreating ? 'criar' : 'atualizar'} assinatura`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
          <div>
            <Label htmlFor="user_id">Usuário/Oficina</Label>
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
                    {oficina.nome_oficina || oficina.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="plan_type">Tipo de Plano</Label>
            <Select
              value={formData.plan_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, plan_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="essencial_mensal">Essencial Mensal</SelectItem>
                <SelectItem value="essencial_anual">Essencial Anual</SelectItem>
                <SelectItem value="premium_mensal">Premium Mensal</SelectItem>
                <SelectItem value="premium_anual">Premium Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
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

          <div>
            <Label htmlFor="starts_at">Data de Início</Label>
            <Input
              id="starts_at"
              type="date"
              value={formData.starts_at}
              onChange={(e) => setFormData(prev => ({ ...prev, starts_at: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="ends_at">Data de Fim</Label>
            <Input
              id="ends_at"
              type="date"
              value={formData.ends_at}
              onChange={(e) => setFormData(prev => ({ ...prev, ends_at: e.target.value }))}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (isCreating ? 'Criar' : 'Atualizar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubscriptionModal;
