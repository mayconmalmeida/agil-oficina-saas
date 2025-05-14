
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";

type ConnectionStatusProps = {
  status: 'checking' | 'connected' | 'error';
};

const AuthConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  if (status === 'checking') {
    return null;
  }
  
  return (
    <>
      {status === 'connected' && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            Conexão com o servidor estabelecida.
          </AlertDescription>
        </Alert>
      )}
      
      {status === 'error' && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Problema de conexão com o servidor. Verifique sua conexão com a internet.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default AuthConnectionStatus;
