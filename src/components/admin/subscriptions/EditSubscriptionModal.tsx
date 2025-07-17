
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ptBR } from 'date-fns/locale';
import StripeCheckoutButton from './StripeCheckoutButton';

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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    oficina_id: '',
    user_id: '',
    plan_type: 'essencial_mensal',
    status: 'active',
    starts_at: new Date(),
    ends_at: null as Date | null,
    amount: 0,
    payment_method: 'manual'
  });

  useEffect(() => {
    if (subscription && !isCreating) {
      setFormData({
        oficina_id: subscription.oficina_id || '',
        user_id: subscription.user_id || '',
        plan_type: subscription.plan || 'essencial_mensal',
        status: subscription.status || 'active',
        starts_at: subscription.started_at ? new Date(subscription.started_at) : new Date(),
        ends_at: subscription.ends_at ? new Date(subscription.ends_at) : null,
        amount: subscription.amount || 0,
        payment_method: subscription.payment_method || 'manual'
      });
    } else if (isCreating) {
      setFormData({
        oficina_id: '',
        user_id: '',
        plan_type: 'essencial_mensal',
        status: 'active',
        starts_at: new Date(),
        ends_at: null,
        amount: 0,
        payment_method: 'manual'
      });
    }
  }, [subscription, isCreating]);

  // Auto-calculate end date based on plan type
  useEffect(() => {
    if (formData.starts_at) {
      const startDate = new Date(formData.starts_at);
      let endDate = new Date(startDate);
      
      if (formData.plan_type.includes('anual')) {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }
      
      setFormData(prev => ({ ...prev, ends_at: endDate }));
    }
  }, [formData.plan_type, formData.starts_at]);

  // Auto-set user_id when oficina is selected
  useEffect(() => {
    if (formData.oficina_id) {
      const selectedOficina = oficinas.find(o => o.id === formData.oficina_id);
      if (selectedOficina) {
        setFormData(prev => ({ ...prev, user_id: selectedOficina.user_id }));
      }
    }
  }, [formData.oficina_id, oficinas]);

  const handleManualSave = async () => {
    try {
      setLoading(true);

      // Validation
      if (!formData.oficina_id) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Selecione uma oficina"
        });
        return;
      }

      if (!formData.user_id) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "User ID é obrigatório"
        });
        return;
      }

      // Use direct SQL query instead of RPC to avoid TypeScript issues
      const { data, error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: formData.user_id,
          plan_type: formData.plan_type,
          status: 'active',
          starts_at: new Date().toISOString(),
          ends_at: formData.ends_at?.toISOString() || null,
          is_manual: true
        }, {
          onConflict: 'user_id'
        })
        .select();

      if (error) {
        console.error('Erro ao salvar assinatura:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: isCreating ? "Assinatura criada com sucesso!" : "Assinatura atualizada com sucesso!"
      });

      onSuccess();
    } catch (error: any) {
      console.error('Erro ao salvar assinatura:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível salvar a assinatura"
      });
    } finally {
      setLoading(false);
    }
  };

  if (oficinas.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nenhuma oficina encontrada</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Nenhuma oficina cadastrada. Cadastre uma oficina antes de atribuir uma assinatura.</p>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Nova Assinatura' : 'Editar Assinatura'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="oficina">Oficina *</Label>
            <Select
              value={formData.oficina_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, oficina_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma oficina" />
              </SelectTrigger>
              <SelectContent>
                {oficinas.map((oficina) => (
                  <SelectItem key={oficina.id} value={oficina.id}>
                    {oficina.nome_oficina}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="plan_type">Plano</Label>
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
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="trialing">Trial</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="expired">Expirada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Data de Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.starts_at && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.starts_at ? (
                    format(formData.starts_at, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.starts_at}
                  onSelect={(date) => setFormData(prev => ({ ...prev, starts_at: date || new Date() }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {formData.ends_at && (
            <div>
              <Label>Data de Término (Calculada Automaticamente)</Label>
              <Input
                value={format(formData.ends_at, "dd/MM/yyyy", { locale: ptBR })}
                disabled
                className="bg-gray-100"
              />
            </div>
          )}

          <div>
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleManualSave} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Manual'}
            </Button>
          </div>
          
          {formData.user_id && (
            <div className="w-full">
              <StripeCheckoutButton
                userId={formData.user_id}
                planType={formData.plan_type}
                disabled={!formData.oficina_id}
              />
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubscriptionModal;
