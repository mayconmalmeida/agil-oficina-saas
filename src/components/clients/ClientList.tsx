
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Client } from '@/utils/supabaseTypes';

export interface ClientListProps {
  searchTerm: string;
  onViewClient: (clientId: string) => void;
  onEditClient: (clientId: string) => void;
  onDeleteClient: (clientId: string) => void;
  searchQuery?: string;
  filters?: any;
  onSelectClient?: (clientId: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({
  searchTerm,
  onViewClient,
  onEditClient,
  onDeleteClient,
  searchQuery,
  filters,
  onSelectClient
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      
      try {
        let query = supabase.from('clients').select('*');
        
        if (searchTerm || searchQuery) {
          const searchValue = searchTerm || searchQuery || '';
          query = query.or(`nome.ilike.%${searchValue}%,telefone.ilike.%${searchValue}%,veiculo.ilike.%${searchValue}%`);
        }
        
        const { data, error } = await query.order('nome');
        
        if (error) throw error;
        
        // Ensure all clients have the required 'tipo' property
        const clientsWithTipo = (data || []).map(client => ({
          ...client,
          tipo: client.tipo || 'pf' // Default to 'pf' if tipo is missing
        })) as Client[];
        
        setClients(clientsWithTipo);
      } catch (error: any) {
        console.error('Error fetching clients:', error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClients();
  }, [searchTerm, searchQuery, filters]);

  const handleClientClick = (clientId: string) => {
    if (onSelectClient) {
      onSelectClient(clientId);
    } else {
      onViewClient(clientId);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Carregando clientes...</div>;
  }

  if (clients.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h3 className="text-lg font-medium">Nenhum cliente encontrado</h3>
        <p className="text-gray-500 mt-2">
          {(searchTerm || searchQuery)
            ? `Nenhum resultado para "${searchTerm || searchQuery}"`
            : 'Cadastre um cliente para começar'
          }
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Veículo</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.nome}</TableCell>
            <TableCell>{client.telefone}</TableCell>
            <TableCell>{client.veiculo}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleClientClick(client.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditClient(client.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteClient(client.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ClientList;
