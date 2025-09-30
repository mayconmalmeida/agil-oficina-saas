
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function UsuariosAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Proteção admin
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

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) {
        setError("Erro ao buscar perfis: " + error.message);
      } else {
        setUsers(data || []);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Usuários (Oficinas)</h1>
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded my-3">
          {error}
        </div>
      )}
      <div className="overflow-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Nome</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Oficina</th>
              <th className="border px-4 py-2">Telefone</th>
              <th className="border px-4 py-2">Cidade</th>
              <th className="border px-4 py-2">Plano</th>
              <th className="border px-4 py-2">Criado em</th>
              <th className="border px-4 py-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border px-4 py-2">{u.id}</td>
                <td className="border px-4 py-2">{u.full_name || u.nome_oficina || "-"}</td>
                <td className="border px-4 py-2">{u.email || "-"}</td>
                <td className="border px-4 py-2">{u.nome_oficina || "-"}</td>
                <td className="border px-4 py-2">{u.telefone || "-"}</td>
                <td className="border px-4 py-2">{u.cidade || "-"}</td>
                <td className="border px-4 py-2">{u.plano || "-"}</td>
                <td className="border px-4 py-2">{u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : "-"}</td>
                <td className="border px-4 py-2">{u.role || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
