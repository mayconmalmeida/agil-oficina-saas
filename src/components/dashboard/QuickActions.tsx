
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
  Headphones,
  MessageCircle
} from "lucide-react";
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

type QuickAction = {
  title: string;
  icon: React.ElementType;
  href: string;
  color: string;
  feature?: string;
  requiresPremium?: boolean;
};

const QuickActions = () => {
  const navigate = useNavigate();
  const { hasPermission, canAccessPremiumFeatures } = usePermissions();
  const { toast } = useToast();
  
  // Ações rápidas disponíveis no dashboard
  const quickActions: QuickAction[] = [
    {
      title: "Novo Orçamento",
      icon: FileText,
      href: "/dashboard/orcamentos",
      color: "bg-blue-500 hover:bg-blue-600 text-white",
      feature: "orcamentos"
    },
    {
      title: "Agendamentos",
      icon: CalendarClock,
      href: "/dashboard/agendamentos",
      color: "bg-purple-500 hover:bg-purple-600 text-white",
      feature: "agendamentos",
      requiresPremium: true
    },
    {
      title: "Clientes",
      icon: Users,
      href: "/dashboard/clientes",
      color: "bg-green-500 hover:bg-green-600 text-white",
      feature: "clientes"
    },
    {
      title: "Produtos",
      icon: Package,
      href: "/dashboard/produtos",
      color: "bg-orange-500 hover:bg-orange-600 text-white",
      feature: "produtos"
    },
    {
      title: "Veículos",
      icon: Car,
      href: "/dashboard/veiculos",
      color: "bg-red-500 hover:bg-red-600 text-white",
      feature: "veiculos"
    },
    {
      title: "Integração Contábil",
      icon: Database,
      href: "/dashboard/integracao-contabil",
      color: "bg-indigo-500 hover:bg-indigo-600 text-white",
      feature: "integracao_contabil",
      requiresPremium: true
    },
    {
      title: "IA Diagnóstico",
      icon: Bot,
      href: "/dashboard/ia-diagnostico",
      color: "bg-emerald-500 hover:bg-emerald-600 text-white",
      feature: "diagnostico_ia",
      requiresPremium: true
    },
    {
      title: "IA Suporte",
      icon: MessageCircle,
      href: "/dashboard/ia-suporte-inteligente",
      color: "bg-cyan-500 hover:bg-cyan-600 text-white",
      feature: "suporte_prioritario",
      requiresPremium: true
    },
    {
      title: "Backup",
      icon: Shield,
      href: "/dashboard/backup",
      color: "bg-teal-500 hover:bg-teal-600 text-white",
      feature: "backup",
      requiresPremium: true
    },
    {
      title: "Suporte",
      icon: Headphones,
      href: "/dashboard/suporte",
      color: "bg-pink-500 hover:bg-pink-600 text-white",
      feature: "suporte_prioritario",
      requiresPremium: true
    },
    {
      title: "Configurações",
      icon: Settings,
      href: "/dashboard/configuracoes",
      color: "bg-gray-500 hover:bg-gray-600 text-white",
      feature: "configuracoes"
    }
  ];
  
  const handleQuickAction = (action: QuickAction) => {
    // Verificar se tem permissão para a feature
    if (action.feature && !hasPermission(action.feature)) {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: `Você não tem permissão para acessar ${action.title}. Considere fazer upgrade do seu plano.`,
      });
      return;
    }

    // Verificar se precisa de premium
    if (action.requiresPremium && !canAccessPremiumFeatures()) {
      toast({
        variant: "destructive",
        title: "Recurso Premium",
        description: `${action.title} está disponível apenas para usuários Premium.`,
      });
      return;
    }

    navigate(action.href);
  };
  
  return (
    <section className="mb-8">
      <h2 className="text-lg font-medium mb-4">Acesso Rápido</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {quickActions.map((action) => {
          const hasAccess = !action.feature || hasPermission(action.feature);
          const isPremiumAvailable = !action.requiresPremium || canAccessPremiumFeatures();
          const isAccessible = hasAccess && isPremiumAvailable;

          return (
            <Button 
              key={action.title}
              variant="default"
              className={`flex flex-col items-center justify-center gap-2 h-20 ${action.color} border-0 w-full shadow-lg transition-all duration-200 hover:scale-105 ${
                !isAccessible ? 'opacity-60' : ''
              }`}
              onClick={() => handleQuickAction(action)}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs text-center font-medium">{action.title}</span>
              {action.requiresPremium && !canAccessPremiumFeatures() && (
                <span className="text-xs opacity-75">Premium</span>
              )}
            </Button>
          );
        })}
      </div>
    </section>
  );
};

export default QuickActions;
