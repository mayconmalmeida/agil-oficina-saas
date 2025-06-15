
import React from "react";
import { Switch } from "@/components/ui/switch";

interface AdminAppearanceSectionProps {
  theme: "light" | "dark";
  onThemeToggle: () => void;
}

const AdminAppearanceSection: React.FC<AdminAppearanceSectionProps> = ({ theme, onThemeToggle }) => {
  return (
    <div className="flex items-center space-x-4">
      <span className="font-medium">Modo Escuro</span>
      <Switch checked={theme === "dark"} onCheckedChange={onThemeToggle} />
      <span className="text-gray-500 text-sm">
        {theme === "dark" ? "Ativado" : "Desativado"}
      </span>
    </div>
  );
};

export default AdminAppearanceSection;
