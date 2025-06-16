
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Car, Package, Wrench, Calendar, FileText, Settings, Database, Bot, Shield, Headphones, MessageCircle, Tag, Truck } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface NavigationLinksProps {
  subscriptionStatus: {
    isPremium: boolean;
    isTrialActive: boolean;
  };
  onNavigate: (href: string, isPremium?: boolean) => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
  { name: 'Veículos', href: '/dashboard/veiculos', icon: Car },
  { name: 'Produtos', href: '/dashboard/produtos', icon: Package },
  { name: 'Categorias', href: '/dashboard/categorias', icon: Tag },
  { name: 'Fornecedores', href: '/dashboard/fornecedores', icon: Truck },
  { name: 'Serviços', href: '/dashboard/servicos', icon: Wrench },
  { name: 'Agendamentos', href: '/dashboard/agendamentos', icon: Calendar, premium: true },
  { name: 'Orçamentos', href: '/dashboard/orcamentos', icon: FileText },
  { name: 'Integração Contábil', href: '/dashboard/integracao-contabil', icon: Database, premium: true },
  { name: 'IA Diagnóstico', href: '/dashboard/ia-diagnostico', icon: Bot, premium: true },
  { name: 'IA Suporte Inteligente', href: '/dashboard/ia-suporte-inteligente', icon: MessageCircle, premium: true },
  { name: 'Backup Automático', href: '/dashboard/backup', icon: Shield, premium: true },
  { name: 'Suporte Prioritário', href: '/dashboard/suporte', icon: Headphones, premium: true },
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
];

const NavigationLinks: React.FC<NavigationLinksProps> = ({ subscriptionStatus, onNavigate }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="mt-5 flex-1 px-2 pb-4 space-y-1">
      {navigation.map((item) => {
        const isItemActive = isActive(item.href);
        const isPremiumLocked = item.premium && !subscriptionStatus.isPremium && !subscriptionStatus.isTrialActive;
        return (
          <button
            key={item.name}
            onClick={() => onNavigate(item.href, item.premium)}
            disabled={isPremiumLocked}
            className={`${
              isItemActive
                ? 'bg-blue-100 text-blue-900'
                : isPremiumLocked
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
          >
            <item.icon
              className={`${
                isItemActive ? 'text-blue-500' : isPremiumLocked ? 'text-gray-300' : 'text-gray-400'
              } mr-3 flex-shrink-0 h-5 w-5`}
            />
            {item.name}
            {item.premium && !subscriptionStatus.isPremium && !subscriptionStatus.isTrialActive && (
              <Badge variant="outline" className="ml-auto text-xs">
                Premium
              </Badge>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default NavigationLinks;
