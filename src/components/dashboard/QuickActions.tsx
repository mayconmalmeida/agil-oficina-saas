
import React, { useEffect, useMemo, useState } from 'react';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";

type QuickAction = {
  id?: string;
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
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const storageKey = useMemo(() => `quickActions:${user?.id ?? 'anon'}`, [user?.id]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Ações rápidas disponíveis no dashboard (catálogo completo)
  const allActions: QuickAction[] = [
    {
      id: "orcamentos",
      title: "Novo Orçamento",
      icon: FileText,
      href: "/dashboard/orcamentos",
      color: "bg-blue-500 hover:bg-blue-600 text-white",
      feature: "orcamentos"
    },
    {
      id: "agendamentos",
      title: "Agendamentos",
      icon: CalendarClock,
      href: "/dashboard/agendamentos",
      color: "bg-purple-500 hover:bg-purple-600 text-white",
      feature: "agendamentos",
      requiresPremium: true
    },
    {
      id: "clientes",
      title: "Clientes",
      icon: Users,
      href: "/dashboard/clientes",
      color: "bg-green-500 hover:bg-green-600 text-white",
      feature: "clientes"
    },
    {
      id: "produtos",
      title: "Produtos",
      icon: Package,
      href: "/dashboard/produtos",
      color: "bg-orange-500 hover:bg-orange-600 text-white",
      feature: "produtos"
    },
    {
      id: "veiculos",
      title: "Veículos",
      icon: Car,
      href: "/dashboard/veiculos",
      color: "bg-red-500 hover:bg-red-600 text-white",
      feature: "veiculos"
    },
    {
      id: "integracao_contabil",
      title: "Integração Contábil",
      icon: Database,
      href: "/dashboard/integracao-contabil",
      color: "bg-indigo-500 hover:bg-indigo-600 text-white",
      feature: "integracao_contabil",
      requiresPremium: true
    },
    {
      id: "diagnostico_ia",
      title: "IA Diagnóstico",
      icon: Bot,
      href: "/dashboard/ia-diagnostico",
      color: "bg-emerald-500 hover:bg-emerald-600 text-white",
      feature: "diagnostico_ia",
      requiresPremium: true
    },
    {
      id: "suporte_inteligente",
      title: "IA Suporte",
      icon: MessageCircle,
      href: "/dashboard/ia-suporte-inteligente",
      color: "bg-cyan-500 hover:bg-cyan-600 text-white",
      feature: "suporte_prioritario",
      requiresPremium: true
    },
    {
      id: "backup",
      title: "Backup",
      icon: Shield,
      href: "/dashboard/backup",
      color: "bg-teal-500 hover:bg-teal-600 text-white",
      feature: "backup",
      requiresPremium: true
    },
    {
      id: "suporte_prioritario",
      title: "Suporte",
      icon: Headphones,
      href: "/dashboard/suporte",
      color: "bg-pink-500 hover:bg-pink-600 text-white",
      feature: "suporte_prioritario",
      requiresPremium: true
    },
    {
      id: "configuracoes",
      title: "Configurações",
      icon: Settings,
      href: "/dashboard/configuracoes",
      color: "bg-gray-500 hover:bg-gray-600 text-white",
      feature: "configuracoes"
    }
  ];

  // Carregar seleção salva ao montar e quando o usuário mudar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const ids = JSON.parse(raw);
        if (Array.isArray(ids)) {
          setSelectedIds(ids.filter((id: string) => allActions.some((a) => a.id === id)));
          return;
        }
      }
      setSelectedIds(allActions.map((a) => a.id!));
    } catch {
      setSelectedIds(allActions.map((a) => a.id!));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
  
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
  
  const visibleActions = useMemo(
    () => allActions.filter((a) => a.id && selectedIds.includes(a.id)),
    [allActions, selectedIds]
  );
  
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  
  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(selectedIds));
    toast({ title: "Acessos Rápidos atualizados", description: "Sua seleção foi salva." });
    setOpen(false);
  };
  
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Acesso Rápido</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">Editar Acessos Rápidos</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Personalizar Acessos Rápidos</DialogTitle>
              <DialogDescription>Selecione os atalhos que deseja exibir no seu dashboard.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
              {allActions.map((action) => (
                <label key={action.id} className="flex items-center gap-3 p-2 border rounded-md">
                  <Checkbox
                    checked={!!action.id && selectedIds.includes(action.id)}
                    onCheckedChange={() => action.id && toggleSelection(action.id)}
                  />
                  <div className="flex items-center gap-2">
                    <action.icon className="h-4 w-4" />
                    <span className="text-sm">{action.title}</span>
                  </div>
                </label>
              ))}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {visibleActions.length === 0 && (
          <div className="col-span-full text-sm text-muted-foreground">Nenhum atalho selecionado. Clique em "Editar Acessos Rápidos" para adicionar.</div>
        )}
        {visibleActions.map((action) => {
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
