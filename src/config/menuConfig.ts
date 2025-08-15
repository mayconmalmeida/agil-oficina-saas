
import { LucideIcon, Home, Users, FileText, Settings, Package, Car, Calendar, Brain, MessageCircle, BarChart3, Building2, CreditCard, TrendingUp, FileX, Bot, HardDrive, LifeBuoy, Layers, UserPlus } from 'lucide-react';

export interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  requiredPlan?: 'essencial' | 'premium';
  requiredPermission?: string;
  isPremium?: boolean;
}

export const menuItems: MenuItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Clientes', path: '/dashboard/clientes', icon: Users },
  { name: 'Orçamentos', path: '/dashboard/orcamentos', icon: FileText },
  { name: 'Serviços', path: '/dashboard/servicos', icon: Settings },
  { name: 'Produtos', path: '/dashboard/produtos', icon: Package },
  { name: 'Veículos', path: '/dashboard/veiculos', icon: Car },
  { name: 'Agendamentos', path: '/dashboard/agendamentos', icon: Calendar },
  { name: 'Fornecedores', path: '/dashboard/fornecedores', icon: Building2 },
  { name: 'Categorias', path: '/dashboard/categorias', icon: Layers },
  { name: 'Empresa', path: '/dashboard/empresa', icon: Building2 },
  { name: 'Configurações', path: '/dashboard/configuracoes', icon: Settings },
];

export const premiumMenuItems: MenuItem[] = [
  { 
    name: 'Relatórios Avançados', 
    path: '/dashboard/relatorios-avancados', 
    icon: TrendingUp,
    requiredPlan: 'premium',
    requiredPermission: 'relatorios_avancados',
    isPremium: true 
  },
  { 
    name: 'Integração Contábil', 
    path: '/dashboard/integracao-contabil', 
    icon: FileX,
    requiredPlan: 'premium',
    requiredPermission: 'integracao_contabil',
    isPremium: true 
  },
  { 
    name: 'IA Diagnóstico', 
    path: '/dashboard/ia-diagnostico', 
    icon: Brain,
    requiredPlan: 'premium',
    requiredPermission: 'diagnostico_ia',
    isPremium: true 
  },
  { 
    name: 'IA Suporte Inteligente', 
    path: '/dashboard/ia-suporte-inteligente', 
    icon: Bot,
    requiredPlan: 'premium',
    requiredPermission: 'suporte_ia',
    isPremium: true 
  },
  { 
    name: 'Backup Automático', 
    path: '/dashboard/backup', 
    icon: HardDrive,
    requiredPlan: 'premium',
    requiredPermission: 'backup',
    isPremium: true 
  },
  { 
    name: 'Suporte Premium', 
    path: '/dashboard/suporte', 
    icon: LifeBuoy,
    requiredPlan: 'premium',
    requiredPermission: 'suporte_prioritario',
    isPremium: true 
  },
];

export const getAllMenuItems = (): MenuItem[] => {
  return [...menuItems, ...premiumMenuItems];
};
