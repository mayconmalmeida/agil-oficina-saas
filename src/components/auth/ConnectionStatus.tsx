
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, WifiOff } from "lucide-react";

interface ConnectionStatusProps {
  status: 'checking' | 'connected' | 'error';
  error?: string | null;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status, error }) => {
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

  if (status === 'error') {
    return (
      <Alert className="mb-4 bg-yellow-50 border-yellow-300">
        <WifiOff className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-700">
          <strong>⚠️ Sistema em Modo de Demonstração</strong><br />
          Estamos enfrentando problemas de conexão com o servidor.<br />
          O registro não funcionará até que a conexão seja restaurada.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 bg-green-50 border-green-200">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-600">
        Conexão com o servidor estabelecida.
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionStatus;
