
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface EditSubscriptionModalProps {
  subscription: any;
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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    plan_type: 'essencial',
    status: 'active',
    starts_at: new Date().toISOString().split('T')[0],
    ends_at: ''
  });

  useEffect(() => {
    if (subscription && !isCreating) {
      setFormData({
        user_id: subscription.user_id,
        plan_type: subscription.plan_type || 'essencial',
        status: subscription.status || 'active',
        starts_at: subscription.starts_at ? new Date(subscription.starts_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        ends_at: subscription.ends_at ? new Date(subscription.ends_at).toISOString().split('T')[0] : ''
      });
    } else if (isCreating) {
      setFormData({
        user_id: '',
        plan_type: 'essencial',
        status: 'active',
        starts_at: new Date().toISOString().split('T')[0],
        ends_at: ''
      });
    }
  }, [subscription, isCreating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const subscriptionData = {
        user_id: formData.user_id,
        plan_type: formData.plan_type,
        status: formData.status,
        starts_at: new Date(formData.starts_at).toISOString(),
        ends_at: formData.ends_at ? new Date(formData.ends_at).toISOString() : null,
        is_manual: true
      };

      if (isCreating) {
        const { error } = await supabase
          .from('user_subscriptions')
          .insert([subscriptionData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Assinatura criada com sucesso!"
        });
      } else {
        const { error } = await supabase
          .from('user_subscriptions')
          .update(subscriptionData)
          .eq('id', subscription.id);

        if (error) throw error;

        toast({
          title: "Sucesso", 
          description: "Assinatura atualizada com sucesso!"
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
      setLoading(false);
    }
  };

  const selectedOficina = oficinas.find(o => o.user_id === formData.user_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Nova Assinatura' : 'Editar Assinatura'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção de Oficina */}
          <div>
            <Label htmlFor="user_id">Oficina</Label>
            <Select
              value={formData.user_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, user_id: value }))}
              disabled={!isCreating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma oficina" />
              </SelectTrigger>
              <SelectContent>
                {oficinas.map((oficina) => (
                  <SelectItem key={oficina.user_id} value={oficina.user_id}>
                    {oficina.nome_oficina} ({oficina.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Plano */}
          <div>
            <Label htmlFor="plan_type">Plano</Label>
            <Select
              value={formData.plan_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, plan_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="essencial">Essencial</SelectItem>
                <SelectItem value="premium_mensal">Premium Mensal</SelectItem>
                <SelectItem value="premium_anual">Premium Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
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
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data de Início */}
          <div>
            <Label htmlFor="starts_at">Data de Início</Label>
            <Input
              type="date"
              value={formData.starts_at}
              onChange={(e) => setFormData(prev => ({ ...prev, starts_at: e.target.value }))}
              required
            />
          </div>

          {/* Data de Fim */}
          <div>
            <Label htmlFor="ends_at">Data de Fim (opcional)</Label>
            <Input
              type="date"
              value={formData.ends_at}
              onChange={(e) => setFormData(prev => ({ ...prev, ends_at: e.target.value }))}
            />
            <p className="text-xs text-gray-500 mt-1">
              Deixe em branco para assinatura sem data de expiração
            </p>
          </div>

          {selectedOficina && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium">Oficina Selecionada:</p>
              <p className="text-sm text-gray-600">{selectedOficina.nome_oficina}</p>
              <p className="text-sm text-gray-600">{selectedOficina.email}</p>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading || !formData.user_id}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isCreating ? 'Criar Assinatura' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubscriptionModal;
