
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit, Eye, MoreHorizontal, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Oficina {
  id: string;
  user_id: string;
  nome_oficina: string | null;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  responsavel: string | null;
  is_active: boolean;
  created_at: string;
  plano: string | null;
  subscription_status?: string;
}

interface OficinasTableProps {
  oficinas: Oficina[];
  isLoading?: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onToggleStatus?: (id: string, currentStatus: boolean) => void;
  onEdit?: (oficina: Oficina) => void;
  onView?: (oficina: Oficina) => void;
  onDelete?: (oficina: Oficina) => void;
}

const OficinasTable: React.FC<OficinasTableProps> = ({
  oficinas,
  isLoading = false,
  searchTerm,
  onSearchChange,
  onToggleStatus,
  onEdit,
  onView,
  onDelete
}) => {
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="w-3 h-3 mr-1" />
        Ativa
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
        <XCircle className="w-3 h-3 mr-1" />
        Inativa
      </Badge>
    );
  };

  const getPlanBadge = (plano: string | null, subscriptionStatus?: string) => {
    if (subscriptionStatus === 'trialing') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700">Trial</Badge>;
    }
    
    if (subscriptionStatus === 'active') {
      return <Badge className="bg-purple-100 text-purple-800">{plano || 'Essencial'}</Badge>;
    }

    return <Badge variant="secondary">Inativo</Badge>;
  };

  const filteredOficinas = oficinas.filter(oficina =>
    (oficina.nome_oficina?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (oficina.cnpj?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (oficina.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (oficina.responsavel?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  return (
    <div className="space-y-4">
      {/* Barra de pesquisa */}
      <div className="flex justify-between items-center">
        <Input
          placeholder="Pesquisar oficinas..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-gray-500">
          {filteredOficinas.length} de {oficinas.length} oficinas
        </div>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableCaption>Lista de todas as oficinas cadastradas no sistema</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Oficina</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Carregando oficinas...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {filteredOficinas.map((oficina) => (
                  <TableRow key={oficina.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {oficina.nome_oficina || 'Nome não informado'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {oficina.responsavel || 'Responsável não informado'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {oficina.email || 'Email não informado'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {oficina.telefone || 'Telefone não informado'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {oficina.cnpj || 'Não informado'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getPlanBadge(oficina.plano, oficina.subscription_status)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(oficina.created_at), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(oficina.is_active)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(oficina)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(oficina)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onToggleStatus && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleStatus(oficina.id, oficina.is_active)}
                            className={`h-8 px-3 text-xs ${
                              oficina.is_active 
                                ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            }`}
                          >
                            {oficina.is_active ? 'Desativar' : 'Ativar'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOficinas.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-gray-500">
                        {searchTerm ? 'Nenhuma oficina encontrada com os critérios de busca.' : 'Nenhuma oficina cadastrada.'}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OficinasTable;
