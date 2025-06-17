
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportRecord {
  id: string;
  tipo: string;
  periodo: string;
  formato: string;
  status: 'concluido' | 'erro' | 'processando';
  data_criacao: string;
  tamanho: string;
}

interface ExportHistoryTableProps {
  exports: ExportRecord[];
}

const ExportHistoryTable: React.FC<ExportHistoryTableProps> = ({ exports }) => {
  const { toast } = useToast();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluido':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Concluído</Badge>;
      case 'erro':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Erro</Badge>;
      case 'processando':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Processando</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleView = (exportRecord: ExportRecord) => {
    toast({
      title: "Visualizar Exportação",
      description: `Abrindo detalhes da exportação: ${exportRecord.tipo} - ${exportRecord.periodo}`,
    });
  };

  const handleDownload = (exportRecord: ExportRecord) => {
    if (exportRecord.status !== 'concluido') {
      toast({
        variant: "destructive",
        title: "Download não disponível",
        description: "Este arquivo não está disponível para download",
      });
      return;
    }

    // Simular download
    const fileName = `${exportRecord.tipo.toLowerCase().replace(' ', '_')}_${exportRecord.periodo}.${exportRecord.formato}`;
    toast({
      title: "Download iniciado",
      description: `Baixando arquivo: ${fileName}`,
    });
  };

  if (exports.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma exportação realizada</h3>
        <p className="text-gray-500">O histórico de exportações aparecerá aqui após realizar exportações</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Tipo</TableHead>
            <TableHead className="font-semibold">Período</TableHead>
            <TableHead className="font-semibold">Formato</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Data</TableHead>
            <TableHead className="font-semibold">Tamanho</TableHead>
            <TableHead className="font-semibold text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exports.map((exportRecord) => (
            <TableRow key={exportRecord.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{exportRecord.tipo}</TableCell>
              <TableCell>{exportRecord.periodo}</TableCell>
              <TableCell>
                <Badge variant="outline" className="uppercase font-mono text-xs">
                  {exportRecord.formato}
                </Badge>
              </TableCell>
              <TableCell>{getStatusBadge(exportRecord.status)}</TableCell>
              <TableCell className="text-gray-600">{formatDate(exportRecord.data_criacao)}</TableCell>
              <TableCell className="text-gray-600">{exportRecord.tamanho}</TableCell>
              <TableCell>
                <div className="flex gap-2 justify-center">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleView(exportRecord)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {exportRecord.status === 'concluido' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownload(exportRecord)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExportHistoryTable;
