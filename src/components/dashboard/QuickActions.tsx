
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  CalendarClock, 
  Users, 
  Package, 
  Settings, 
  Car, 
  Plus 
} from "lucide-react";
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';

type QuickAction = {
  title: string;
  icon: React.ElementType;
  href: string;
  color: string;
  isPremium?: boolean;
};

const QuickActions = () => {
  const navigate = useNavigate();
  const { handlePremiumFeature, isPremium } = usePremiumFeatures('essencial', 7);
  
  // Ações rápidas disponíveis no dashboard
  const quickActions: QuickAction[] = [
    {
      title: "Novo Orçamento",
      icon: FileText,
      href: "/orcamentos/novo",
      color: "bg-amber-100 hover:bg-amber-200 text-amber-700"
    },
    {
      title: "Novo Agendamento",
      icon: CalendarClock,
      href: "/agendamentos/novo",
      color: "bg-purple-100 hover:bg-purple-200 text-purple-700",
      isPremium: true
    },
    {
      title: "Novo Cliente",
      icon: Users,
      href: "/clientes/novo",
      color: "bg-blue-100 hover:bg-blue-200 text-blue-700"
    },
    {
      title: "Novo Produto",
      icon: Package,
      href: "/produtos/novo",
      color: "bg-green-100 hover:bg-green-200 text-green-700"
    },
    {
      title: "Novo Veículo",
      icon: Car,
      href: "/veiculos/novo",
      color: "bg-orange-100 hover:bg-orange-200 text-orange-700"
    },
    {
      title: "Configurações",
      icon: Settings,
      href: "/configuracoes",
      color: "bg-gray-100 hover:bg-gray-200 text-gray-700"
    }
  ];
  
  const handleQuickAction = (action: QuickAction) => {
    if (action.isPremium && !isPremium) {
      handlePremiumFeature('advanced_scheduling');
      return;
    }
    navigate(action.href);
  };
  
  return (
    <section className="mb-8">
      <h2 className="text-lg font-medium mb-4">Acesso Rápido</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {quickActions.map((action) => (
          <Button 
            key={action.title}
            variant="outline"
            className={`flex flex-col items-center justify-center gap-2 h-24 ${action.color} border-0 w-full`}
            onClick={() => handleQuickAction(action)}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-sm text-center">{action.title}</span>
            {action.isPremium && !isPremium && (
              <span className="absolute top-2 right-2">
                <Plus className="h-3 w-3" />
              </span>
            )}
          </Button>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
