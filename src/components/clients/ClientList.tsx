
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ClientListProps {
  onSelectClient: (clientId: string) => void;
  searchQuery?: string;
}

// Mock data - replace with actual data from your API
const mockClients = [
  {
    id: "1",
    nome: "João Silva",
    telefone: "(11) 98765-4321",
    email: "joao.silva@email.com",
    documento: "123.456.789-00",
    veiculos: 2,
    ultimaVisita: "2023-05-12",
  },
  {
    id: "2",
    nome: "Maria Oliveira",
    telefone: "(11) 91234-5678",
    email: "maria.oliveira@email.com",
    documento: "987.654.321-00",
    veiculos: 1,
    ultimaVisita: "2023-06-23",
  },
  {
    id: "3",
    nome: "Carlos Pereira",
    telefone: "(11) 92345-6789",
    email: "carlos.pereira@email.com",
    documento: "456.789.123-00",
    veiculos: 3,
    ultimaVisita: "2023-04-05",
  },
];

const ClientList: React.FC<ClientListProps> = ({ onSelectClient, searchQuery = '' }) => {
  // Filter clients based on search query
  const filteredClients = mockClients.filter(client => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      client.nome.toLowerCase().includes(searchLower) ||
      client.telefone.includes(searchQuery) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.documento.includes(searchQuery)
    );
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">CPF/CNPJ</TableHead>
            <TableHead>Veículos</TableHead>
            <TableHead>Última visita</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.nome}</TableCell>
              <TableCell>{client.telefone}</TableCell>
              <TableCell className="hidden md:table-cell">{client.email}</TableCell>
              <TableCell className="hidden md:table-cell">{client.documento}</TableCell>
              <TableCell>
                <Badge variant="outline">{client.veiculos}</Badge>
              </TableCell>
              <TableCell>{formatDate(client.ultimaVisita)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSelectClient(client.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          
          {filteredClients.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Nenhum cliente encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientList;
