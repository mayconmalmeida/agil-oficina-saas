
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, WifiOff } from "lucide-react";

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
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠️ Problema de conexão com o servidor</strong><br />
            Não foi possível estabelecer conexão com o Supabase.<br />
            Verifique se as variáveis <code className="bg-red-100 px-1 rounded">VITE_SUPABASE_URL</code> e <code className="bg-red-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> estão corretamente configuradas.<br />
            Clique no botão <strong>Supabase</strong> no canto superior direito para tentar reconectar.
            <div className="mt-2 text-xs italic">
              Sem essa conexão, funcionalidades administrativas estarão indisponíveis.
            </div>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default AuthConnectionStatus;
