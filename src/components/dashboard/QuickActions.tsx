
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
      href: "/dashboard/orcamentos",
      color: "bg-blue-500 hover:bg-blue-600 text-white"
    },
    {
      title: "Agendamentos",
      icon: CalendarClock,
      href: "/dashboard/agendamentos",
      color: "bg-purple-500 hover:bg-purple-600 text-white"
    },
    {
      title: "Clientes",
      icon: Users,
      href: "/dashboard/clientes",
      color: "bg-green-500 hover:bg-green-600 text-white"
    },
    {
      title: "Produtos",
      icon: Package,
      href: "/dashboard/produtos",
      color: "bg-orange-500 hover:bg-orange-600 text-white"
    },
    {
      title: "Veículos",
      icon: Car,
      href: "/dashboard/veiculos",
      color: "bg-red-500 hover:bg-red-600 text-white"
    },
    {
      title: "Configurações",
      icon: Settings,
      href: "/dashboard/configuracoes",
      color: "bg-gray-500 hover:bg-gray-600 text-white"
    }
  ];
  
  const handleQuickAction = (action: QuickAction) => {
    navigate(action.href);
  };
  
  return (
    <section className="mb-8">
      <h2 className="text-lg font-medium mb-4">Acesso Rápido</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickActions.map((action) => (
          <Button 
            key={action.title}
            variant="default"
            className={`flex flex-col items-center justify-center gap-2 h-20 ${action.color} border-0 w-full shadow-lg transition-all duration-200 hover:scale-105`}
            onClick={() => handleQuickAction(action)}
          >
            <action.icon className="h-5 w-5" />
            <span className="text-xs text-center font-medium">{action.title}</span>
          </Button>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
