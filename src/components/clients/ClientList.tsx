
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Eye, Edit, XCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/utils/supabaseTypes';
import { ClientListHeader } from './ClientList/ClientListHeader';
import { ClientListRow } from './ClientList/ClientListRow';
import { InactivateDialog } from './ClientList/InactivateDialog';
import { EmptyState } from './ClientList/EmptyState';
import { LoadingState } from './ClientList/LoadingState';

interface ClientListProps {
  searchTerm?: string;
  filters?: any;
  onSelectClient?: (clientId: string) => void;
  onViewClient?: (clientId: string) => void;
  onEditClient?: (clientId: string) => void;
  onDeleteClient?: (clientId: string) => void;
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
  
  const handleInactivateDialog = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    setSelectedClientId(clientId);
    setIsInactivateDialogOpen(true);
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
              <LoadingState />
            ) : filteredClients.length === 0 ? (
              <EmptyState />
            ) : (
              filteredClients.map((client) => (
                <ClientListRow
                  key={client.id}
                  client={client}
                  onRowClick={handleRowClick}
                  onView={handleView}
                  onEdit={handleEdit}
                  onToggleStatus={handleInactivateDialog}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <InactivateDialog
        isOpen={isInactivateDialogOpen}
        setIsOpen={setIsInactivateDialogOpen}
        onConfirm={handleToggleActive}
        client={clients.find(c => c.id === selectedClientId)}
      />
    </div>
  );
};

export default ClientList;
