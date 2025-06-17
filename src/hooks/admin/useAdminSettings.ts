
import { useState, useCallback, useEffect } from "react";
import { useAdminContext } from "@/contexts/AdminContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type AdminProfile = {
  name: string;
  email: string;
};

export function useAdminSettings() {
  const { user, signOut } = useAdminContext();
  const [activeTab, setActiveTab] = useState("perfil");
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    name: user?.email?.split("@")[0] || "Admin",
    email: user?.email || "",
  });
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("admin-theme") as "light" | "dark") || "light"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setAdminProfile({
      name: user?.email?.split("@")[0] || "Admin",
      email: user?.email || "",
    });
  }, [user]);

  // Simples toggle theme
  const onThemeToggle = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("admin-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  }, [theme]);

  // Salvar o nome de exibição (atualiza o perfil na tabela profiles)
  const onUpdateProfile = async (values: AdminProfile) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (user?.id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            full_name: values.name,
            email: values.email 
          })
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }

        setAdminProfile(values);
        toast({
          title: "Perfil atualizado",
          description: "Informações do perfil atualizadas com sucesso.",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      setError("Erro ao atualizar perfil");
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Troca de senha agora usa o sistema de autenticação do Supabase
  const onChangePassword = async (values: { currentPassword: string; newPassword: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Usar o sistema de autenticação seguro do Supabase
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword
      });

      if (error) {
        throw error;
      }

      toast({ 
        title: "Senha alterada", 
        description: "Sua senha foi atualizada com sucesso." 
      });
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      setError("Erro ao alterar senha.");
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível alterar a senha.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onLogout = useCallback(() => {
    signOut();
  }, [signOut]);

  return {
    activeTab,
    setActiveTab,
    adminProfile,
    theme,
    onThemeToggle,
    onUpdateProfile,
    onChangePassword,
    isLoading,
    error,
    onLogout,
  };
}
