
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Calendar } from 'lucide-react';

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
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluido':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'erro':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Erro</Badge>;
      case 'processando':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Processando</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (exports.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Nenhuma exportação realizada</h3>
        <p className="text-gray-500 mt-2">O histórico de exportações aparecerá aqui</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Formato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Tamanho</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exports.map((exportRecord) => (
            <TableRow key={exportRecord.id}>
              <TableCell className="font-medium">{exportRecord.tipo}</TableCell>
              <TableCell>{exportRecord.periodo}</TableCell>
              <TableCell className="uppercase">{exportRecord.formato}</TableCell>
              <TableCell>{getStatusBadge(exportRecord.status)}</TableCell>
              <TableCell>{formatDate(exportRecord.data_criacao)}</TableCell>
              <TableCell>{exportRecord.tamanho}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {exportRecord.status === 'concluido' && (
                    <>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
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
