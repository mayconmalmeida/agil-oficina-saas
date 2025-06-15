
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminLoginPage = () => {
  const [logged, setLogged] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    // Verifica se há sessão ativa
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) setLogged(!!session);
    };
    checkSession();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    setLoadingLogout(true);
    const { error } = await supabase.auth.signOut();
    setLoadingLogout(false);
    if (!error) {
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
      setLogged(false);
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao realizar logout."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Login Administrativo</h1>
        <p className="text-gray-600 text-center">
          Página de login para administradores será implementada aqui.
        </p>
        {logged && (
          <button
            onClick={handleLogout}
            className="mt-6 w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            disabled={loadingLogout}
          >
            {loadingLogout ? "Saindo..." : "Sair"}
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminLoginPage;
