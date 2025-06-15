
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import Loading from "@/components/ui/loading";

interface Oficina {
  id: string;
  user_id: string;
  nome_oficina: string | null;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

const AdminUsers = () => {
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Proteção: apenas admins/superadmins
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Oficinas Registradas</h1>
        <Button onClick={fetchOficinas} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
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
              </tr>
            </thead>
            <tbody>
              {oficinas.map((o) => (
                <tr key={o.id}>
                  <td className="border px-4 py-2">{o.id}</td>
                  <td className="border px-4 py-2">{o.nome_oficina || "-"}</td>
                  <td className="border px-4 py-2">{o.cnpj || "-"}</td>
                  <td className="border px-4 py-2">{o.telefone || "-"}</td>
                  <td className="border px-4 py-2">{o.email || "-"}</td>
                  <td className="border px-4 py-2">
                    {o.is_active === false ? (
                      <span className="text-red-600">Inativa</span>
                    ) : (
                      <span className="text-green-700">Ativa</span>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {o.created_at ? new Date(o.created_at).toLocaleDateString("pt-BR") : "-"}
                  </td>
                </tr>
              ))}
              {oficinas.length === 0 && (
                <tr>
                  <td className="border px-4 py-2 text-center text-gray-400" colSpan={7}>
                    Nenhuma oficina cadastrada.
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
