
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import Loading from '@/components/ui/loading';

// Interface baseada na tabela profiles
export interface ProfileUser {
  id: string;
  full_name: string | null;
  email: string | null;
  nome_oficina: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  plano: string | null;
  cnpj?: string | null;
  responsavel?: string | null;
  is_active?: boolean | null;
  created_at: string | null;
  role?: string | null;
  trial_ends_at?: string | null;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<ProfileUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Proteção: Só admins!
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

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar perfis:", error);
      setError("Erro ao buscar perfis: " + error.message);
      setUsers([]);
      setIsLoading(false);
      return;
    }

    setUsers(data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefreshData = () => {
    fetchUsers();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Oficinas Registradas (Tabela profiles)</h1>
      <p className="text-gray-600 mb-6">Aqui estão todas as oficinas cadastradas no sistema.</p>

      <div className="flex justify-end mb-4">
        <Button onClick={handleRefreshData} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar dados
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded my-3">
          {error}
        </div>
      )}

      {isLoading ? (
        <Loading fullscreen={false} text="Carregando oficinas..." />
      ) : (
        <div className="overflow-auto bg-white rounded-lg shadow">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Nome</th>
                <th className="border px-4 py-2">Nome da Oficina</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Telefone</th>
                <th className="border px-4 py-2">Cidade</th>
                <th className="border px-4 py-2">Plano</th>
                <th className="border px-4 py-2">Criado em</th>
                <th className="border px-4 py-2">Papel</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="border px-4 py-2">{u.id}</td>
                  <td className="border px-4 py-2">{u.full_name || '-'}</td>
                  <td className="border px-4 py-2">{u.nome_oficina || '-'}</td>
                  <td className="border px-4 py-2">{u.email || '-'}</td>
                  <td className="border px-4 py-2">{u.telefone || '-'}</td>
                  <td className="border px-4 py-2">{u.cidade || '-'}</td>
                  <td className="border px-4 py-2">{u.plano || '-'}</td>
                  <td className="border px-4 py-2">{u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : '-'}</td>
                  <td className="border px-4 py-2">{u.role || '-'}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="border px-4 py-2 text-center text-gray-400" colSpan={9}>
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
