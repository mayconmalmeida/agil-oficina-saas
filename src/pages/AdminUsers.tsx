
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw, LogOut } from "lucide-react";
import Loading from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Oficina {
  id: string;
  user_id: string;
  nome_oficina: string | null;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  responsavel: string | null;
  is_active: boolean | null;
  ativo: boolean | null;
  created_at: string | null;
  trial_ends_at: string | null;
  plano: string | null;
  subscription_plan?: string;
  subscription_status?: string;
}

const AdminUsers = () => {
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        navigate("/admin/login");
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      if (!data || (data.role !== "admin" && data.role !== "superadmin")) {
        navigate("/dashboard");
      }
    };
    checkAdmin();
  }, [navigate]);

  const fetchOficinas = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Buscar oficinas da tabela profiles (incluindo email que já está armazenado lá)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          created_at,
          nome_oficina,
          cnpj,
          telefone,
          email,
          responsavel,
          is_active,
          plano
        `)
        .not('nome_oficina', 'is', null) // Only get profiles that have workshop names
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar assinaturas mais recentes para cada oficina
      const userIds = profilesData?.map(p => p.id) || [];
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from("user_subscriptions")
        .select("user_id, plan_type, status, created_at")
        .in("user_id", userIds)
        .order("created_at", { ascending: false });

      if (subscriptionsError) {
        console.error("Erro ao buscar assinaturas:", subscriptionsError);
      }

      // Criar mapa de assinaturas mais recentes por oficina
      const subscriptionMap = new Map();
      subscriptionsData?.forEach(sub => {
        if (!subscriptionMap.has(sub.user_id)) {
          subscriptionMap.set(sub.user_id, sub);
        }
      });

      // Mapear dados para o formato esperado com plano baseado na assinatura
      const mappedData = (profilesData || []).map(profile => {
        const subscription = subscriptionMap.get(profile.id);
        let planDisplayName = "Inativo";
        
        if (subscription) {
          if (subscription.status === 'trialing') {
            planDisplayName = "Trial";
          } else if (subscription.status === 'active') {
            if (subscription.plan_type.includes('premium')) {
              planDisplayName = "Premium";
            } else if (subscription.plan_type.includes('essencial')) {
              planDisplayName = "Essencial";
            }
          }
        }

        return {
          id: profile.id,
          user_id: profile.id, // In profiles table, id is the user_id
          nome_oficina: profile.nome_oficina,
          cnpj: profile.cnpj,
          telefone: profile.telefone,
          email: profile.email || null,
          responsavel: profile.responsavel,
          is_active: profile.is_active ?? true, // Default to true if null
          ativo: profile.is_active ?? true,
          created_at: profile.created_at,
          trial_ends_at: null, // Not available in profiles
          plano: profile.plano,
          subscription_plan: planDisplayName,
          subscription_status: subscription?.status || 'inactive'
        };
      });
      
      setOficinas(mappedData);
    } catch (error: any) {
      setError("Erro ao buscar oficinas: " + error.message);
      setOficinas([]);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOficinas();
  }, []);

  const [editingExpiry, setEditingExpiry] = useState<string | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState("");

  const toggleStatus = async (id: string, currentStatus: boolean | null | undefined) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        is_active: !currentStatus,
      })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao atualizar status da oficina",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Status atualizado!",
        variant: "default"
      });
      fetchOficinas();
    }
  };

  const updateExpiryDate = async (id: string, newDate: string) => {
    // Note: trial_ends_at is not available in profiles table
    // This functionality might need to be handled differently or removed
    toast({
      title: "Funcionalidade não disponível",
      description: "A data de expiração não está disponível na tabela de perfis",
      variant: "destructive"
    });
  };

  const updatePlan = async (id: string, newPlan: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        plano: newPlan,
      })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao atualizar plano",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Plano atualizado!",
        variant: "default"
      });
      fetchOficinas();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    // O signOut do AuthContext já redireciona para /login
  };

  // Filtro de busca (por nome ou CNPJ)
  const filteredOficinas = oficinas.filter(
    (o) =>
      (o.nome_oficina || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.cnpj || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Oficinas Registradas</h1>
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sair do painel">
            <LogOut />
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar nome ou CNPJ..."
            className="max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={fetchOficinas} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      <p className="text-gray-600 mb-4">
        Lista de todas as oficinas clientes cadastradas no sistema.
      </p>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded my-3">{error}</div>
      )}

      {isLoading ? (
        <Loading fullscreen={false} text="Carregando oficinas..." />
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Oficina</th>
                <th className="border px-4 py-2">CNPJ</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Plano</th>
                <th className="border px-4 py-2">Vencimento</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOficinas.map((o) => (
                <tr key={o.id}>
                  <td className="border px-4 py-2">
                    <div>
                      <p className="font-medium">{o.nome_oficina || "Não definido"}</p>
                      <p className="text-sm text-gray-500">{o.responsavel || ""}</p>
                    </div>
                  </td>
                  <td className="border px-4 py-2">{o.cnpj || "-"}</td>
                  <td className="border px-4 py-2">{o.email || "-"}</td>
                  <td className="border px-4 py-2">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-semibold">
                        {o.subscription_plan || "Inativo"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Status: {o.subscription_status === 'active' ? 'Ativo' : 
                                o.subscription_status === 'trialing' ? 'Trial' : 'Inativo'}
                      </div>
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    {editingExpiry === o.id ? (
                      <div className="flex gap-1">
                        <Input
                          type="date"
                          value={newExpiryDate}
                          onChange={(e) => setNewExpiryDate(e.target.value)}
                          className="w-32 text-xs"
                        />
                        <Button size="sm" variant="outline" onClick={() => updateExpiryDate(o.id, newExpiryDate)}>
                          ✓
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingExpiry(null)}>
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {o.trial_ends_at ? new Date(o.trial_ends_at).toLocaleDateString("pt-BR") : "Sem data"}
                        </span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            setEditingExpiry(o.id);
                            setNewExpiryDate(o.trial_ends_at ? o.trial_ends_at.split('T')[0] : "");
                          }}
                          className="p-1 h-6"
                        >
                          ✏️
                        </Button>
                      </div>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {o.is_active === false ? (
                      <Badge variant="destructive">Inativa</Badge>
                    ) : (
                      <Badge variant="default">Ativa</Badge>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    <Button
                      variant={o.is_active ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleStatus(o.id, o.is_active)}
                    >
                      {o.is_active ? "Inativar" : "Ativar"}
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredOficinas.length === 0 && (
                <tr>
                  <td className="border px-4 py-2 text-center text-gray-400" colSpan={7}>
                    Nenhuma oficina encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
