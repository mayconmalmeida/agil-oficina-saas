
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Check, X } from 'lucide-react';
import { Service } from '@/utils/supabaseTypes';
import { formatCurrency } from '@/utils/formatUtils';

interface ServiceListProps {
  services: Service[];
  loading: boolean;
  searchQuery: string;
  onEdit: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({ 
  services, 
  loading, 
  searchQuery,
  onEdit,
  onToggleStatus
}) => {
  // Filter services based on search query
  const filteredServices = services.filter(service => 
    !searchQuery || 
    service.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.descricao?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.tipo.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getStatusBadge = (isActive: boolean = true) => {
    return isActive ? (
      <Badge variant="outline" className="bg-green-100 text-green-800">Ativo</Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-100 text-gray-800">Inativo</Badge>
    );
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Carregando serviços...
              </TableCell>
            </TableRow>
          )}
          
          {!loading && filteredServices.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Nenhum serviço ou produto encontrado.
              </TableCell>
            </TableRow>
          )}

          {!loading && filteredServices.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.nome}</TableCell>
              <TableCell className="capitalize">{service.tipo}</TableCell>
              <TableCell className="text-right">{formatCurrency(service.valor)}</TableCell>
              <TableCell>{getStatusBadge(service.is_active)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Editar"
                    onClick={() => onEdit(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title={service.is_active ? "Inativar" : "Ativar"}
                    onClick={() => onToggleStatus(service)}
                  >
                    {service.is_active ? (
                      <X className="h-4 w-4 text-red-500" />
                    ) : (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ServiceList;
