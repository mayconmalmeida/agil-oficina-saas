
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, CheckCircle, AlertCircle } from 'lucide-react';

interface ProcessedProduct {
  nome: string;
  codigo: string;
  quantidade: string;
  status: 'novo' | 'atualizado';
}

interface ProcessResult {
  produtos_processados: ProcessedProduct[];
  novos_produtos: ProcessedProduct[];
  produtos_atualizados: ProcessedProduct[];
}

interface ProcessResultSectionProps {
  result: ProcessResult;
  onClose: () => void;
}

const ProcessResultSection: React.FC<ProcessResultSectionProps> = ({ result, onClose }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'novo':
        return <PlusCircle className="h-4 w-4 text-green-600" />;
      case 'atualizado':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'novo':
        return <Badge variant="default" className="bg-green-100 text-green-800">➕ Novo Produto</Badge>;
      case 'atualizado':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">✅ Atualizado</Badge>;
      default:
        return <Badge variant="secondary">❓ Desconhecido</Badge>;
    }
  };

  return (
    <>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          ✅ Processamento Concluído
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Total de produtos:</span> {result.produtos_processados.length}
          </div>
          <div>
            <span className="font-medium">Produtos novos:</span> {result.novos_produtos.length}
          </div>
          <div>
            <span className="font-medium">Produtos atualizados:</span> {result.produtos_atualizados.length}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium mb-3">Relatório de Importação</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Qtd.</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.produtos_processados.map((produto, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{produto.nome}</TableCell>
                <TableCell>{produto.codigo}</TableCell>
                <TableCell>{produto.quantidade}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(produto.status)}
                    {getStatusBadge(produto.status)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button onClick={onClose}>
          Fechar
        </Button>
      </div>
    </>
  );
};

export default ProcessResultSection;
