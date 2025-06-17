
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, Package, Eye } from 'lucide-react';

interface ExportRecord {
  id: string;
  tipo: string;
  periodo: string;
  formato: string;
  status: 'concluido' | 'erro' | 'processando';
  data_criacao: string;
  tamanho: string;
}

interface ExportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportRecord: ExportRecord | null;
  onDownload: (exportRecord: ExportRecord) => void;
}

const ExportDetailsModal: React.FC<ExportDetailsModalProps> = ({
  isOpen,
  onClose,
  exportRecord,
  onDownload
}) => {
  if (!exportRecord) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluido':
        return <Badge className="bg-green-100 text-green-800 border-green-300">✓ Concluído</Badge>;
      case 'erro':
        return <Badge className="bg-red-100 text-red-800 border-red-300">✗ Erro</Badge>;
      case 'processando':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">⏳ Processando</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFormatIcon = (formato: string) => {
    switch (formato.toLowerCase()) {
      case 'xml':
        return '📄';
      case 'excel':
        return '📊';
      case 'csv':
        return '📋';
      default:
        return '📁';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Detalhes da Exportação
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações básicas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              {getStatusBadge(exportRecord.status)}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Tipo:</span>
              <span className="font-medium">{exportRecord.tipo}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Período:</span>
              <span className="font-medium">{exportRecord.periodo}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Formato:</span>
              <div className="flex items-center gap-2">
                <span>{getFormatIcon(exportRecord.formato)}</span>
                <Badge variant="outline" className="uppercase font-mono text-xs">
                  {exportRecord.formato}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Tamanho:</span>
              <span className="font-medium">{exportRecord.tamanho}</span>
            </div>
            
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-gray-600">Data de Criação:</span>
              <span className="font-medium text-right">{formatDate(exportRecord.data_criacao)}</span>
            </div>
          </div>

          {/* Informações adicionais baseadas no status */}
          {exportRecord.status === 'erro' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">
                <strong>Erro durante a exportação:</strong><br />
                Falha ao processar os dados. Tente novamente ou contate o suporte se o problema persistir.
              </p>
            </div>
          )}

          {exportRecord.status === 'processando' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm">
                <strong>Exportação em andamento:</strong><br />
                O arquivo está sendo processado. Você será notificado quando estiver pronto para download.
              </p>
            </div>
          )}

          {exportRecord.status === 'concluido' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                <strong>Exportação concluída:</strong><br />
                O arquivo está pronto para download e permanecerá disponível por 30 dias.
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Fechar
            </Button>
            {exportRecord.status === 'concluido' && (
              <Button onClick={() => onDownload(exportRecord)} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Baixar Arquivo
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDetailsModal;
