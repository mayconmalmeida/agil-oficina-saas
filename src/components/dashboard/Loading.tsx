
import React from 'react';
import { Loader2 } from "lucide-react";

const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-xl">Carregando...</p>
      </div>
    </div>
  );
};

export default Loading;
