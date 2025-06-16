
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
  Database,
  Bot,
  Shield,
  Headphones
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
      color: "bg-purple-500 hover:bg-purple-600 text-white",
      isPremium: true
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
      title: "Integração Contábil",
      icon: Database,
      href: "/dashboard/integracao-contabil",
      color: "bg-indigo-500 hover:bg-indigo-600 text-white",
      isPremium: true
    },
    {
      title: "IA Diagnóstico",
      icon: Bot,
      href: "/dashboard/ia-diagnostico",
      color: "bg-emerald-500 hover:bg-emerald-600 text-white",
      isPremium: true
    },
    {
      title: "Backup",
      icon: Shield,
      href: "/dashboard/backup",
      color: "bg-teal-500 hover:bg-teal-600 text-white",
      isPremium: true
    },
    {
      title: "Suporte",
      icon: Headphones,
      href: "/dashboard/suporte",
      color: "bg-pink-500 hover:bg-pink-600 text-white",
      isPremium: true
    },
    {
      title: "Configurações",
      icon: Settings,
      href: "/dashboard/configuracoes",
      color: "bg-gray-500 hover:bg-gray-600 text-white"
    }
  ];
  
  const handleQuickAction = (action: QuickAction) => {
    if (action.isPremium && !handlePremiumFeature('advanced_scheduling')) {
      return;
    }
    navigate(action.href);
  };
  
  return (
    <section className="mb-8">
      <h2 className="text-lg font-medium mb-4">Acesso Rápido</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {quickActions.map((action) => (
          <Button 
            key={action.title}
            variant="default"
            className={`flex flex-col items-center justify-center gap-2 h-20 ${action.color} border-0 w-full shadow-lg transition-all duration-200 hover:scale-105 ${
              action.isPremium && !isPremium ? 'opacity-60' : ''
            }`}
            onClick={() => handleQuickAction(action)}
          >
            <action.icon className="h-5 w-5" />
            <span className="text-xs text-center font-medium">{action.title}</span>
            {action.isPremium && !isPremium && (
              <span className="text-xs opacity-75">Premium</span>
            )}
          </Button>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
