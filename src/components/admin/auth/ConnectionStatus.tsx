
import React from 'react';
import { Loader2, CheckCircle, XCircle } from "lucide-react";

type ConnectionStatusProps = {
  status: 'checking' | 'connected' | 'error';
  errorMessage?: string | null;
};

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status, errorMessage }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-amber-600" />;
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Verificando conexão com o servidor...';
      case 'connected':
        return 'Conexão estabelecida com sucesso';
      case 'error':
        return errorMessage || 'Erro de conexão com o servidor';
      default:
        return 'Status desconhecido';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'text-amber-600
      case 'connected':
        return 'text-green-600
      case 'error':
        return 'text-red-600
      default:
        return 'text-slate-600
    }
  };

  return (
    <div className={`flex items-center space-x-2 text-sm ${getStatusColor()}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
    </div>
  );
};

export default ConnectionStatus;
