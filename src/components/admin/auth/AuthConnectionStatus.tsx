
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, WifiOff, Clock } from "lucide-react";

type ConnectionStatusProps = {
  status: 'checking' | 'connected' | 'error' | 'cors-error' | 'timeout';
  errorDetails?: string;
};

const AuthConnectionStatus: React.FC<ConnectionStatusProps> = ({ status, errorDetails }) => {
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
  
  if (status === 'connected') {
    return (
      <Alert className="mb-4 bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-600">
          Conexão com o servidor estabelecida.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (status === 'cors-error') {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>❌ Erro de CORS detectado</strong><br />
          O servidor Supabase está bloqueando requisições de origem cruzada.<br />
          <strong>Solução:</strong> Vá até as configurações do Supabase (Project Settings {'->'} API {'->'} CORS) 
          e adicione o domínio atual às origens permitidas.<br />
          <div className="mt-2 text-xs bg-red-100 p-2 rounded">
            <strong>Detalhes:</strong> {errorDetails}
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (status === 'timeout') {
    return (
      <Alert variant="destructive" className="mb-4">
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>⏱️ Timeout de conexão</strong><br />
          O servidor Supabase não respondeu em tempo hábil ({'>'}5s).<br />
          Isso pode indicar sobrecarga ou problemas de infraestrutura.<br />
          <strong>Sugestão:</strong> Verifique o status em <a href="https://status.supabase.com/" target="_blank" className="underline">status.supabase.com</a>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert variant="destructive" className="mb-4">
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        <strong>⚠️ Problema de conexão com o servidor</strong><br />
        Não foi possível estabelecer conexão com o Supabase.<br />
        {errorDetails && (
          <div className="mt-2 text-xs bg-red-100 p-2 rounded">
            <strong>Detalhes:</strong> {errorDetails}
          </div>
        )}
        <div className="mt-2 text-xs italic">
          Sem essa conexão, funcionalidades administrativas estarão indisponíveis.
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default AuthConnectionStatus;
