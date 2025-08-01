
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
import { CheckCircle, Info } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

type PlanUpgradeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PlanUpgradeModal = ({ open, onOpenChange }: PlanUpgradeModalProps) => {
  const { toast } = useToast();

  const handleContactAdmin = () => {
    toast({
      title: "Entre em contato",
      description: "Para ativar ou alterar seu plano, entre em contato com o administrador do sistema.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Planos Disponíveis</DialogTitle>
          <DialogDescription>
            Escolha o plano ideal para sua oficina. Para ativação, entre em contato com o administrador.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 md:grid-cols-2">
          {/* Plano Essencial */}
          <div className="border rounded-md p-5 space-y-4">
            <div className="font-medium text-lg">OficinaÁgil Essencial</div>
            <div>
              <div className="text-2xl font-bold">Plano Essencial</div>
              <div className="text-sm text-muted-foreground">Recursos fundamentais</div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Indicado para pequenas oficinas que estão começando.
            </div>
            
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Gestão de clientes</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Orçamentos digitais</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Controle de serviços</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Relatórios básicos</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Suporte por email</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Backup automático</span>
              </li>
            </ul>
            
            <Button 
              onClick={handleContactAdmin} 
              className="w-full"
              variant="outline"
            >
              Solicitar Plano Essencial
            </Button>
          </div>
          
          {/* Plano Premium */}
          <div className="border border-purple-200 bg-purple-50/50 rounded-md p-5 space-y-4 relative">
            <div className="absolute -top-3 right-4 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
              RECOMENDADO
            </div>
            <div className="font-medium text-lg">OficinaÁgil Premium</div>
            <div>
              <div className="text-2xl font-bold">Plano Premium</div>
              <div className="text-sm text-muted-foreground">Recursos completos</div>
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
                <span>IA para diagnóstico</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Agendamentos inteligentes</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Relatórios avançados</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Marketing automático</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Suporte prioritário</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Integração contábil</span>
              </li>
            </ul>
            
            <Button 
              onClick={handleContactAdmin} 
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Solicitar Plano Premium
            </Button>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:space-x-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 sm:mt-0">
            <Info className="h-4 w-4" />
            <span>Entre em contato com o administrador para ativar seu plano</span>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlanUpgradeModal;
