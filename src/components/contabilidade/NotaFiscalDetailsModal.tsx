
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, DollarSign, Building2, User } from 'lucide-react';

interface NotaFiscal {
  id: string;
  tipo: 'entrada' | 'saida';
  numero: string;
  data_emissao: string;
  valor_total: number;
  status: string;
  fornecedor_id?: string;
  cliente_id?: string;
  fornecedor_nome?: string;
  fornecedor_cnpj?: string;
  cliente_nome?: string;
  cliente_documento?: string;
}

interface NotaFiscalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  nota: NotaFiscal | null;
  onDownload: (nota: NotaFiscal) => void;
}

const NotaFiscalDetailsModal: React.FC<NotaFiscalDetailsModalProps> = ({
  isOpen,
  onClose,
  nota,
  onDownload
}) => {
  if (!nota) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'importado':
      case 'emitido':
        return <Badge className="bg-green-100 text-green-800 border-green-300">✓ {status}</Badge>;
      case 'erro':
        return <Badge className="bg-red-100 text-red-800 border-red-300">✗ Erro</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">⏳ {status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes da Nota Fiscal #{nota.numero}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Tipo</label>
              <div className="flex items-center gap-2">
                {nota.tipo === 'entrada' ? '📥' : '📤'}
                <span className="capitalize font-medium">{nota.tipo}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div>{getStatusBadge(nota.status)}</div>
            </div>
          </div>

          {/* Data e Valor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Data de Emissão
              </label>
              <p className="font-medium">{formatDate(nota.data_emissao)}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Valor Total
              </label>
              <p className="text-lg font-bold text-green-600">{formatCurrency(nota.valor_total)}</p>
            </div>
          </div>

          {/* Fornecedor/Cliente */}
          {nota.tipo === 'entrada' && (nota.fornecedor_nome || nota.fornecedor_cnpj) && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                Fornecedor
              </label>
              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="font-medium">{nota.fornecedor_nome || 'N/A'}</p>
                <p className="text-sm text-gray-600">{nota.fornecedor_cnpj || 'CNPJ não informado'}</p>
              </div>
            </div>
          )}

          {nota.tipo === 'saida' && (nota.cliente_nome || nota.cliente_documento) && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <User className="h-4 w-4" />
                Cliente
              </label>
              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="font-medium">{nota.cliente_nome || 'N/A'}</p>
                <p className="text-sm text-gray-600">{nota.cliente_documento || 'Documento não informado'}</p>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Fechar
            </Button>
            <Button onClick={() => onDownload(nota)} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Baixar XML
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotaFiscalDetailsModal;
