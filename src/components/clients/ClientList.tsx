
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Eye, Edit, XCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface ClientListProps {
  searchTerm?: string;
  filters?: any;
  onSelectClient?: (clientId: string) => void;
  onViewClient?: (clientId: string) => void;
  onEditClient?: (clientId: string) => void;
  onDeleteClient?: (clientId: string) => void;
}

interface Client {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  veiculo: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  placa?: string;
  is_active?: boolean;
}

const ClientList: React.FC<ClientListProps> = ({
  searchTerm = '',
  filters = {},
  onSelectClient,
  onViewClient,
  onEditClient,
  onDeleteClient,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isInactivateDialogOpen, setIsInactivateDialogOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchClients();
  }, [filters]);
  
  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*');
      
      if (error) {
        console.error("Error fetching clients:", error);
        return;
      }
      
      if (data) {
        setClients(data as Client[]);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRowClick = (clientId: string) => {
    if (onSelectClient) {
      onSelectClient(clientId);
    }
  };
  
  const handleView = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    if (onViewClient) {
      onViewClient(clientId);
    }
  };
  
  const handleEdit = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    if (onEditClient) {
      onEditClient(clientId);
    }
  };
  
  const handleInactivateDialog = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    setSelectedClientId(clientId);
    setIsInactivateDialogOpen(true);
  };
  
  const handleToggleActive = async () => {
    if (!selectedClientId) return;
    
    const clientToUpdate = clients.find(c => c.id === selectedClientId);
    if (!clientToUpdate) return;
    
    const newActiveStatus = !clientToUpdate.is_active;
    
    try {
      const { error } = await supabase
        .from('clients')
        .update({ is_active: newActiveStatus })
        .eq('id', selectedClientId);
      
      if (error) {
        console.error("Error updating client status:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: `Não foi possível ${newActiveStatus ? 'ativar' : 'inativar'} o cliente.`,
        });
        return;
      }
      
      toast({
        title: newActiveStatus ? "Cliente ativado" : "Cliente inativado",
        description: `Cliente ${newActiveStatus ? 'ativado' : 'inativado'} com sucesso.`,
      });
      
      // Update client in local state
      setClients(prev => 
        prev.map(client => 
          client.id === selectedClientId 
            ? { ...client, is_active: newActiveStatus } 
            : client
        )
      );
      
      // Close dialog
      setIsInactivateDialogOpen(false);
      
      // If client was inactivated and it was selected, notify parent
      if (!newActiveStatus && onDeleteClient) {
        onDeleteClient(selectedClientId);
      }
      
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status do cliente.",
      });
    }
  };
  
  // Filter clients based on search term and filters
  const filteredClients = clients.filter(client => {
    // Apply search filter
    if (searchTerm && !client.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !client.email?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !client.telefone?.includes(searchTerm) &&
        !client.veiculo?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply additional filters
    return true;
  });
  
  return (
    <div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="hidden lg:table-cell">Veículo</TableHead>
              <TableHead className="hidden md:table-cell">Placa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Carregando clientes...
                </TableCell>
              </TableRow>
            ) : filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow 
                  key={client.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRowClick(client.id)}
                >
                  <TableCell className="font-medium">{client.nome}</TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-xs">
                        <Phone className="h-3 w-3 mr-1 text-gray-500" />
                        <span>{client.telefone || '-'}</span>
                      </div>
                      {client.email && (
                        <div className="flex items-center text-xs">
                          <Mail className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{client.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {client.marca ? `${client.marca} ${client.modelo || ''}` : client.veiculo || '-'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{client.placa || '-'}</TableCell>
                  <TableCell>
                    {client.is_active === false ? (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800">Inativo</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-100 text-green-800">Ativo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={(e) => handleView(e, client.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => handleEdit(e, client.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleInactivateDialog(e, client.id)}
                      >
                        {client.is_active === false ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <AlertDialog 
        open={isInactivateDialogOpen} 
        onOpenChange={setIsInactivateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {clients.find(c => c.id === selectedClientId)?.is_active === false
                ? "Ativar Cliente"
                : "Inativar Cliente"
              }
            </AlertDialogTitle>
            <AlertDialogDescription>
              {clients.find(c => c.id === selectedClientId)?.is_active === false
                ? "Tem certeza que deseja ativar este cliente? Ele voltará a aparecer em todas as listagens."
                : "Tem certeza que deseja inativar este cliente? Ele não será mais exibido em listagens ativas."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleActive}>
              {clients.find(c => c.id === selectedClientId)?.is_active === false
                ? "Ativar"
                : "Inativar"
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientList;
