
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export default function AdminPlanosPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        navigate('/admin/login');
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
      <h1 className="text-2xl font-bold mb-4">Planos</h1>
      <div className="p-6 bg-white rounded shadow text-gray-700 max-w-xl">
        Em breve: Gestão dos planos disponíveis.
      </div>
    </div>
  );
}
