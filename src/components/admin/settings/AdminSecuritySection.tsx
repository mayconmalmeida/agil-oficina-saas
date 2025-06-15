
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdminSecuritySectionProps {
  onChangePassword: (values: { currentPassword: string; newPassword: string }) => void;
  onLogout: () => void;
  isLoading: boolean;
  error?: string | null;
}

const AdminSecuritySection: React.FC<AdminSecuritySectionProps> = ({
  onChangePassword,
  onLogout,
  isLoading,
  error,
}) => {
  const [fields, setFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fields.newPassword !== fields.confirmPassword) return;
    onChangePassword({ currentPassword: fields.currentPassword, newPassword: fields.newPassword });
  };

  return (
    <form className="space-y-6 max-w-md" onSubmit={handleSubmit}>
      <div>
        <label className="block font-medium mb-1">Senha Atual</label>
        <Input
          type="password"
          value={fields.currentPassword}
          disabled={isLoading}
          onChange={e => setFields(f => ({ ...f, currentPassword: e.target.value }))}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Nova Senha</label>
        <Input
          type="password"
          value={fields.newPassword}
          disabled={isLoading}
          onChange={e => setFields(f => ({ ...f, newPassword: e.target.value }))}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Confirmar Nova Senha</label>
        <Input
          type="password"
          value={fields.confirmPassword}
          disabled={isLoading}
          onChange={e => setFields(f => ({ ...f, confirmPassword: e.target.value }))}
        />
      </div>
      {fields.newPassword !== fields.confirmPassword && (
        <p className="text-red-500 text-sm">As senhas não conferem.</p>
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || fields.newPassword !== fields.confirmPassword}>
          {isLoading ? "Alterando..." : "Alterar Senha"}
        </Button>
        <Button variant="destructive" type="button" className="ml-auto" onClick={onLogout}>
          Sair do painel
        </Button>
      </div>
    </form>
  );
};

export default AdminSecuritySection;
