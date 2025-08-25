
import React from "react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";

interface AdminAppearanceSectionProps {
  theme: "light" | "dark";
  onThemeToggle: () => void;
}

const AdminAppearanceSection: React.FC<AdminAppearanceSectionProps> = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="flex items-center space-x-4">
      <span className="font-medium">Modo Escuro</span>
      <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
      <span className="text-muted-foreground text-sm">
        {theme === "dark" ? "Ativado" : "Desativado"}
      </span>
    </div>
  );
};

export default AdminAppearanceSection;
