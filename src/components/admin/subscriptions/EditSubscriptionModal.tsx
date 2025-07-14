import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  starts_at: string;
  ends_at: string | null;
  trial_ends_at: string | null;
  oficina_nome?: string;
}

interface EditSubscriptionModalProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isCreating?: boolean;
  oficinas?: Array<{ id: string; nome_oficina: string; user_id: string }>;
}

const EditSubscriptionModal: React.FC<EditSubscriptionModalProps> = ({
  subscription,
  isOpen,
  onClose,
  onSuccess,
  isCreating = false,
  oficinas = []
}) => {
  const [formData, setFormData] = useState({
    user_id: '',
    plan_type: 'essencial_mensal',
    status: 'active',
    starts_at: new Date(),
    ends_at: new Date(),
    trial_ends_at: null as Date | null
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (subscription && !isCreating) {
      // Função para validar e converter datas
      const parseDate = (dateString: string | null): Date => {
        if (!dateString) return new Date();
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? new Date() : date;
      };

      const parseOptionalDate = (dateString: string | null): Date | null => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
      };

      setFormData({
        user_id: subscription.user_id,
        plan_type: subscription.plan_type,
        status: subscription.status,
        starts_at: parseDate(subscription.starts_at),
        ends_at: parseDate(subscription.ends_at),
        trial_ends_at: parseOptionalDate(subscription.trial_ends_at)
      });
    } else if (isCreating) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      setFormData({
        user_id: '',
        plan_type: 'essencial_mensal',
        status: 'active',
        starts_at: new Date(),
        ends_at: nextMonth,
        trial_ends_at: null
      });
    }
  }, [subscription, isCreating]);

  const handleSave = async () => {
    if (!formData.user_id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione uma oficina"
      });
      return;
    }

    setLoading(true);
    try {
      const subscriptionData = {
        user_id: formData.user_id,
        plan_type: formData.plan_type,
        status: formData.status,
        starts_at: formData.starts_at.toISOString(),
        ends_at: formData.ends_at.toISOString(),
        trial_ends_at: formData.trial_ends_at?.toISOString() || null
      };

      if (isCreating) {
        const { error } = await supabase
          .from('user_subscriptions')
          .insert(subscriptionData);

        if (error) throw error;

        // Atualizar a oficina com os dados da assinatura
        const planTypeSimple = formData.plan_type.includes('premium') ? 'Premium' : 'Essencial';
        const isTrialing = formData.status === 'trialing';
        
        const oficinaUpdates: any = {
          plano: planTypeSimple,
          is_active: true
        };

        if (isTrialing && formData.trial_ends_at) {
          oficinaUpdates.trial_ends_at = formData.trial_ends_at.toISOString();
        } else if (formData.status === 'active') {
          oficinaUpdates.trial_ends_at = null; // Limpar trial se for assinatura ativa
        }

        const { error: oficinaError } = await supabase
          .from('oficinas')
          .update(oficinaUpdates)
          .eq('user_id', formData.user_id);

        if (oficinaError) {
          console.error('Erro ao atualizar oficina:', oficinaError);
          // Não falhar todo o processo se erro na oficina
        }

        toast({
          title: "Sucesso",
          description: "Assinatura criada e oficina atualizada com sucesso!"
        });
      } else {
        const { error } = await supabase
          .from('user_subscriptions')
          .update(subscriptionData)
          .eq('id', subscription!.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Assinatura atualizada com sucesso!"
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar assinatura:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao salvar assinatura"
      });
    } finally {
      setLoading(false);
    }
  };

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
            <Label>Oficina</Label>
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
                    {oficina.nome_oficina || 'Nome não definido'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tipo de Plano</Label>
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
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => {
                setFormData(prev => {
                  const newData = { ...prev, status: value };
                  
                  // Se for trialing, automaticamente definir data de fim do trial (+7 dias)
                  if (value === 'trialing') {
                    const trialEnd = new Date();
                    trialEnd.setDate(trialEnd.getDate() + 7);
                    newData.trial_ends_at = trialEnd;
                  } else if (value === 'active') {
                    // Se for ativo, limpar trial_ends_at
                    newData.trial_ends_at = null;
                  }
                  
                  return newData;
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="trialing">Em teste</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Data de Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.starts_at && !isNaN(formData.starts_at.getTime()) 
                    ? format(formData.starts_at, "dd/MM/yyyy", { locale: ptBR })
                    : "Selecione uma data"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.starts_at && !isNaN(formData.starts_at.getTime()) ? formData.starts_at : undefined}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, starts_at: date }))}
                  locale={ptBR}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Data de Expiração</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.ends_at && !isNaN(formData.ends_at.getTime()) 
                    ? format(formData.ends_at, "dd/MM/yyyy", { locale: ptBR })
                    : "Selecione uma data"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.ends_at && !isNaN(formData.ends_at.getTime()) ? formData.ends_at : undefined}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, ends_at: date }))}
                  locale={ptBR}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {formData.status === 'trialing' && (
            <div>
              <Label>Data de Fim do Teste</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.trial_ends_at && !isNaN(formData.trial_ends_at.getTime()) 
                      ? format(formData.trial_ends_at, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecione uma data"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.trial_ends_at && !isNaN(formData.trial_ends_at.getTime()) ? formData.trial_ends_at : undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, trial_ends_at: date }))}
                    locale={ptBR}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading} className="flex-1">
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubscriptionModal;