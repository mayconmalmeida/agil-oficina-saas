
import React, { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
      <p className="mt-2 text-gray-600">
        Bem-vindo ao painel admin! Acesse as áreas de usuários, assinaturas, planos e configurações pelo menu lateral.
      </p>
    </div>
  );
}
