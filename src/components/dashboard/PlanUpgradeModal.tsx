import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useStripeSubscription } from '@/hooks/useStripeSubscription';

type PlanUpgradeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PlanUpgradeModal = ({ open, onOpenChange }: PlanUpgradeModalProps) => {
  const { createCheckoutSession, loading } = useStripeSubscription();

  const handleUpgrade = async (planType: 'essencial' | 'premium', interval: 'mensal' | 'anual') => {
    await createCheckoutSession(planType, interval);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Atualize seu plano</DialogTitle>
          <DialogDescription>
            Escolha o plano ideal para sua oficina e comece a aproveitar todos os recursos
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 md:grid-cols-2">
          {/* Plano Essencial */}
          <div className="border rounded-md p-5 space-y-4">
            <div className="font-medium text-lg">OficinaÁgil Essencial</div>
            <div>
              <div className="text-2xl font-bold">R$ 89,90<span className="text-sm font-normal">/mês</span></div>
              <div className="text-sm text-muted-foreground">por usuário</div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Indicado para pequenas oficinas que estão começando.
            </div>
            
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Sistema de orçamentos completo</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Cadastro de clientes ilimitado</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Cadastro de produtos e peças</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Controle de estoque</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Gestão de veículos</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Suporte técnico por e-mail</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Atualizações constantes</span>
              </li>
            </ul>
            
            <div className="space-y-2">
              <Button 
                onClick={() => handleUpgrade('essencial', 'mensal')} 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Assinar Mensal'}
              </Button>
              <Button 
                onClick={() => handleUpgrade('essencial', 'anual')} 
                variant="outline" 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Anual (2 meses grátis)'}
              </Button>
            </div>
          </div>
          
          {/* Plano Premium */}
          <div className="border border-purple-200 bg-purple-50/50 rounded-md p-5 space-y-4 relative">
            <div className="absolute -top-3 right-4 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
              RECOMENDADO
            </div>
            <div className="font-medium text-lg">OficinaÁgil Premium</div>
            <div>
              <div className="text-2xl font-bold">R$ 179,90<span className="text-sm font-normal">/mês</span></div>
              <div className="text-sm text-muted-foreground">por usuário</div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Para oficinas que querem crescer com automação e gestão completa.
            </div>
            
            <ul className="space-y-2 text-sm">
              <li className="flex items-start font-medium">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Tudo do plano Essencial, mais:</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Relatórios gerenciais</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Exportação XML para contabilidade</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Ferramenta de campanhas de marketing</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Agendamento de serviços</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Suporte técnico prioritário por e-mail e chat</span>
              </li>
            </ul>
            
            <div className="space-y-2">
              <Button 
                onClick={() => handleUpgrade('premium', 'mensal')} 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Assinar Mensal'}
              </Button>
              <Button 
                onClick={() => handleUpgrade('premium', 'anual')} 
                variant="outline" 
                className="w-full border-purple-200 text-purple-700 hover:bg-purple-100"
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Anual (2 meses grátis)'}
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <div className="text-xs text-muted-foreground mt-4 sm:mt-0">
            Os valores serão cobrados após o período de teste. Você pode cancelar a qualquer momento.
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlanUpgradeModal;
