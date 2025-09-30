
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdminProfileSectionProps {
  adminProfile: { name: string; email: string };
  onSubmit: (values: { name: string; email: string }) => void;
  isLoading: boolean;
  error?: string | null;
}

const AdminProfileSection: React.FC<AdminProfileSectionProps> = ({
  adminProfile,
  onSubmit,
  isLoading,
  error,
}) => {
  const [values, setValues] = useState(adminProfile);

  React.useEffect(() => {
    setValues(adminProfile);
  }, [adminProfile]);

  return (
    <form
      className="space-y-6 max-w-md"
      onSubmit={e => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      <div>
        <label className="block font-medium mb-1">Nome</label>
        <Input
          value={values.name}
          disabled={isLoading}
          onChange={e => setValues({ ...values, name: e.target.value })}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Email</label>
        <Input
          value={values.email}
          disabled={true}
          readOnly
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  );
};

export default AdminProfileSection;
