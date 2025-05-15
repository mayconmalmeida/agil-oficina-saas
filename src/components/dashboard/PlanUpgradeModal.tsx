
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

type PlanUpgradeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PlanUpgradeModal = ({ open, onOpenChange }: PlanUpgradeModalProps) => {
  const handleUpgrade = (planType: string, interval: string) => {
    // Here you would integrate with your payment processor
    // For now, we'll just close the modal and show a toast
    console.log(`Selected plan: ${planType}, interval: ${interval}`);
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
            <div className="font-medium text-lg">Essencial</div>
            <div>
              <div className="text-2xl font-bold">R$ 39,90<span className="text-sm font-normal">/mês</span></div>
              <div className="text-sm text-muted-foreground">R$ 430,92/ano (10% de desconto)</div>
            </div>
            
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Orçamentos ilimitados</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Cadastro de clientes</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Gestão de estoque básica</span>
              </li>
            </ul>
            
            <div className="space-y-2">
              <Button 
                onClick={() => handleUpgrade('essencial', 'monthly')} 
                className="w-full"
              >
                Mensal
              </Button>
              <Button 
                onClick={() => handleUpgrade('essencial', 'yearly')} 
                variant="outline" 
                className="w-full"
              >
                Anual (10% desconto)
              </Button>
            </div>
          </div>
          
          {/* Plano Premium */}
          <div className="border border-purple-200 bg-purple-50/50 rounded-md p-5 space-y-4 relative">
            <div className="absolute -top-3 right-4 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
              RECOMENDADO
            </div>
            <div className="font-medium text-lg">Premium</div>
            <div>
              <div className="text-2xl font-bold">R$ 79,90<span className="text-sm font-normal">/mês</span></div>
              <div className="text-sm text-muted-foreground">R$ 863,12/ano (10% de desconto)</div>
            </div>
            
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Tudo do plano Essencial</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Relatórios avançados</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Agendamentos integrados</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Suporte prioritário</span>
              </li>
            </ul>
            
            <div className="space-y-2">
              <Button 
                onClick={() => handleUpgrade('premium', 'monthly')} 
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Mensal
              </Button>
              <Button 
                onClick={() => handleUpgrade('premium', 'yearly')} 
                variant="outline" 
                className="w-full border-purple-200 text-purple-700 hover:bg-purple-100"
              >
                Anual (10% desconto)
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
