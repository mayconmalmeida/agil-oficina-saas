
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw, LogOut } from "lucide-react";
import Loading from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Oficina {
  id: string;
  user_id: string;
  nome_oficina: string | null;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  is_active: boolean | null;
  ativo: boolean | null;
  created_at: string | null;
}

const AdminUsers = () => {
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

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

    const { data, error } = await supabase
      .from("oficinas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Erro ao buscar oficinas: " + error.message);
      setOficinas([]);
      setIsLoading(false);
      return;
    }
    setOficinas(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOficinas();
  }, []);

  const toggleStatus = async (id: string, currentStatus: boolean | null | undefined) => {
    // Atualiza ambos os campos, por segurança de legados
    const { error } = await supabase
      .from("oficinas")
      .update({
        is_active: !currentStatus,
        ativo: !currentStatus,
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
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
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Oficina</th>
                <th className="border px-4 py-2">CNPJ</th>
                <th className="border px-4 py-2">Telefone</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Criada em</th>
                <th className="border px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOficinas.map((o) => (
                <tr key={o.id}>
                  <td className="border px-4 py-2">{o.id}</td>
                  <td className="border px-4 py-2">{o.nome_oficina || "-"}</td>
                  <td className="border px-4 py-2">{o.cnpj || "-"}</td>
                  <td className="border px-4 py-2">{o.telefone || "-"}</td>
                  <td className="border px-4 py-2">{o.email || "-"}</td>
                  <td className="border px-4 py-2">
                    {o.is_active === false || o.ativo === false ? (
                      <Badge variant="destructive">Inativa</Badge>
                    ) : (
                      <Badge variant="default">Ativa</Badge>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {o.created_at ? new Date(o.created_at).toLocaleDateString("pt-BR") : "-"}
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
                  <td className="border px-4 py-2 text-center text-gray-400" colSpan={8}>
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
