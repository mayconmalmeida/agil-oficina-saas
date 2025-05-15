import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatPhoneNumber } from '@/utils/formatUtils';
import { Client } from '@/utils/supabaseTypes';

interface ClientListProps {
  onSelectClient: (clientId: string) => void;
  searchQuery?: string;
  filters?: any; // Added filters prop
}

const ClientList: React.FC<ClientListProps> = ({ onSelectClient, searchQuery, filters }) => {
  const clients: Client[] = [
    {
      id: '1',
      user_id: 'user123',
      nome: 'João da Silva',
      telefone: '(11) 99999-9999',
      email: 'joao@example.com',
      veiculo: 'Fiat Uno 2020, Placa ABC-1234',
      created_at: '2024-01-25T10:00:00Z'
    },
    {
      id: '2',
      user_id: 'user123',
      nome: 'Maria Souza',
      telefone: '(21) 88888-8888',
      email: 'maria@example.com',
      veiculo: 'Volkswagen Gol 2018, Placa DEF-5678',
      created_at: '2024-01-24T15:30:00Z'
    },
    {
      id: '3',
      user_id: 'user123',
      nome: 'Carlos Pereira',
      telefone: '(31) 77777-7777',
      email: 'carlos@example.com',
      veiculo: 'Ford Ka 2022, Placa GHI-9012',
      created_at: '2024-01-23T20:45:00Z'
    },
  ];

  const filteredClients = clients.filter(client => {
    const searchStr = searchQuery ? searchQuery.toLowerCase() : '';
    return (
      client.nome.toLowerCase().includes(searchStr) ||
      client.telefone.includes(searchStr) ||
      (client.email && client.email.toLowerCase().includes(searchStr)) ||
      client.veiculo.toLowerCase().includes(searchStr)
    );
  });

  return (
    <div className="space-y-4">
      {filteredClients.map(client => (
        <Card key={client.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelectClient(client.id)}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{client.nome}</h3>
                <p className="text-sm text-gray-500">{client.veiculo}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">{formatPhoneNumber(client.telefone)}</p>
                {client.email && <p className="text-sm text-gray-600">{client.email}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClientList;
