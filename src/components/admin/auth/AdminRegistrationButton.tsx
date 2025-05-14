
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus } from "lucide-react";

type AdminRegistrationButtonProps = {
  onRegister: () => Promise<void>;
  isRegistering: boolean;
  isDisabled: boolean;
};

const AdminRegistrationButton: React.FC<AdminRegistrationButtonProps> = ({ 
  onRegister, 
  isRegistering, 
  isDisabled 
}) => {
  return (
    <div className="mt-6">
      <Button 
        type="button"
        variant="outline"
        className="w-full"
        onClick={onRegister}
        disabled={isRegistering || isDisabled}
      >
        {isRegistering ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cadastrando administrador...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" />
            Cadastrar Administrador
          </>
        )}
      </Button>
    </div>
  );
};

export default AdminRegistrationButton;
