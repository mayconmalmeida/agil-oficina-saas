
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

  // Salvar o nome de exibição (modo fictício, pode ser estendido)
  const onUpdateProfile = async (values: AdminProfile) => {
    setIsLoading(true);
    setError(null);
    // Suportado apenas atualizar nome em nível de frontend, pois admin está apenas na tabela "admins"
    setAdminProfile(values);
    setIsLoading(false);
    toast({
      title: "Perfil atualizado",
      description: "Nome alterado com sucesso (apenas local/visual).",
    });
  };

  // Simples troca de senha do admin (padrão: atualiza admins, mas requer backend real para produção)
  const onChangePassword = async (values: { currentPassword: string; newPassword: string }) => {
    setIsLoading(true);
    setError(null);

    // Busca admin pelo e-mail (não há autenticação real de senha nesse mockup, necessário backend customizado para produção)
    const { data, error: adminError } = await supabase
      .from("admins")
      .select("*")
      .eq("email", adminProfile.email)
      .maybeSingle();

    if (adminError || !data) {
      setError("Não foi possível encontrar o administrador.");
      setIsLoading(false);
      return;
    }

    if (values.currentPassword !== data.password) {
      setError("Senha atual incorreta.");
      setIsLoading(false);
      return;
    }

    // Atualiza senha
    const { error: updateError } = await supabase
      .from("admins")
      .update({ password: values.newPassword })
      .eq("email", adminProfile.email);

    if (updateError) {
      setError("Erro ao alterar senha.");
      setIsLoading(false);
      return;
    }

    toast({ title: "Senha alterada", description: "Sua senha foi atualizada com sucesso." });
    setIsLoading(false);
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
