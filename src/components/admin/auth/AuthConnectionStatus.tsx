
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";

type ConnectionStatusProps = {
  status: 'checking' | 'connected' | 'error';
};

const AuthConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  if (status === 'checking') {
    return (
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <div className="animate-pulse flex items-center">
          <div className="h-4 w-4 bg-blue-400 rounded-full mr-2"></div>
          <AlertDescription className="text-blue-600">
            Verificando conexão com o servidor...
          </AlertDescription>
        </div>
      </Alert>
    );
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
            Problema de conexão com o servidor. Clique no botão verde Supabase no canto superior direito para conectar.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default AuthConnectionStatus;
