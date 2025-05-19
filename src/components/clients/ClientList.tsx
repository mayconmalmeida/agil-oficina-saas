
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
}

const ClientList: React.FC<ClientListProps> = ({
  searchTerm,
  onViewClient,
  onEditClient,
  onDeleteClient
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      
      try {
        let query = supabase.from('clients').select('*');
        
        if (searchTerm) {
          query = query.or(`nome.ilike.%${searchTerm}%,telefone.ilike.%${searchTerm}%,veiculo.ilike.%${searchTerm}%`);
        }
        
        const { data, error } = await query.order('nome');
        
        if (error) throw error;
        
        setClients(data || []);
      } catch (error: any) {
        console.error('Error fetching clients:', error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClients();
  }, [searchTerm]);

  if (loading) {
    return <div className="flex justify-center p-4">Carregando clientes...</div>;
  }

  if (clients.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h3 className="text-lg font-medium">Nenhum cliente encontrado</h3>
        <p className="text-gray-500 mt-2">
          {searchTerm 
            ? `Nenhum resultado para "${searchTerm}"`
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
                  onClick={() => onViewClient(client.id)}
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
