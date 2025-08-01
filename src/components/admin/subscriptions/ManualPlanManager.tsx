
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon } from 'lucide-react';

interface ManualPlanManagerProps {
  userId: string;
  userEmail: string;
  currentPlan?: string;
  currentStatus?: string;
  currentEndDate?: string;
  onUpdate?: () => void;
}

const ManualPlanManager: React.FC<ManualPlanManagerProps> = ({
  userId,
  userEmail,
  currentPlan = '',
  currentStatus = '',
  currentEndDate = '',
  onUpdate
}) => {
  const [planType, setPlanType] = useState(currentPlan);
  const [isActive, setIsActive] = useState(currentStatus === 'active');
  const [endDate, setEndDate] = useState(currentEndDate ? currentEndDate.split('T')[0] : '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!planType) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um plano"
      });
      return;
    }

    setLoading(true);
    try {
      const subscriptionData = {
        user_id: userId,
        plan_type: planType,
        status: isActive ? 'active' : 'cancelled',
        starts_at: new Date().toISOString(),
        ends_at: endDate ? new Date(endDate + 'T23:59:59.999Z').toISOString() : null,
        is_manual: true,
        updated_at: new Date().toISOString()
      };

      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .upsert([subscriptionData], { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (subscriptionError) {
        throw subscriptionError;
      }

      // Também atualizar o profile para consistência
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          plano: planType === 'premium' ? 'Premium' : 
                 planType === 'enterprise' ? 'Enterprise' : 'Essencial'
        })
        .eq('id', userId);

      if (profileError) {
        console.warn('Erro ao atualizar profile, mas assinatura foi salva:', profileError);
      }

      toast({
        title: "Sucesso",
        description: `Plano ${planType} ${isActive ? 'ativado' : 'desativado'} para ${userEmail}`
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      console.error('Erro ao salvar plano:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível salvar as configurações do plano"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Configuração Manual do Plano</CardTitle>
        <p className="text-sm text-muted-foreground">
          Usuário: {userEmail}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="plan-type">Tipo do Plano</Label>
            <Select value={planType} onValueChange={setPlanType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="essencial">Essencial</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">Data Limite (opcional)</Label>
            <div className="relative">
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10"
              />
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Deixe em branco para acesso ilimitado
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active-status"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="active-status">
            Plano {isActive ? 'Ativo' : 'Inativo'}
          </Label>
        </div>

        {planType && (
          <div className="p-3 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Recursos do Plano {planType}:</h4>
            <div className="text-sm space-y-1">
              {planType === 'essencial' && (
                <>
                  <div>• Gestão de clientes</div>
                  <div>• Orçamentos digitais</div>
                  <div>• Controle de serviços</div>
                  <div>• Relatórios básicos</div>
                  <div>• IA para Suporte Inteligente</div>
                </>
              )}
              {planType === 'premium' && (
                <>
                  <div>• Todos os recursos do Essencial</div>
                  <div>• IA para Diagnóstico</div>
                  <div>• Agendamentos inteligentes</div>
                  <div>• Relatórios avançados</div>
                  <div>• Marketing automático</div>
                  <div>• Integração contábil</div>
                </>
              )}
              {planType === 'enterprise' && (
                <>
                  <div>• Todos os recursos do Premium</div>
                  <div>• Multi-filiais</div>
                  <div>• API personalizada</div>
                  <div>• Treinamento dedicado</div>
                  <div>• SLA garantido</div>
                </>
              )}
            </div>
          </div>
        )}

        <Button 
          onClick={handleSave} 
          disabled={loading || !planType}
          className="w-full"
        >
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ManualPlanManager;
