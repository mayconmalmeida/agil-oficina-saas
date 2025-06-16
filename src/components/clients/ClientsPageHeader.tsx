
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';

interface ClientsPageHeaderProps {
  showWelcomeMessage?: boolean;
}

const ClientsPageHeader: React.FC<ClientsPageHeaderProps> = ({ 
  showWelcomeMessage = false 
}) => {
  const [hasClients, setHasClients] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkIfHasClients();
  }, []);

  const checkIfHasClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (error) throw error;

      setHasClients((data || []).length > 0);
    } catch (error) {
      console.error('Error checking clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show the welcome message if user already has clients or if explicitly disabled
  if (isLoading || hasClients || !showWelcomeMessage) {
    return null;
  }

  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold text-oficina-dark">
        Adicione seu Primeiro Cliente
      </h1>
      <p className="mt-2 text-oficina-gray">
        Cadastre os dados básicos do cliente e seu veículo
      </p>
      
      <div className="mt-4">
        <Progress value={50} className="h-2 w-full max-w-xs mx-auto" />
        <p className="text-xs text-oficina-gray mt-1">Etapa 2 de 4</p>
      </div>
    </div>
  );
};

export default ClientsPageHeader;
