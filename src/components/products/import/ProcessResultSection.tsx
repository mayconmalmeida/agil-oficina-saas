
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Package, Building } from 'lucide-react';

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
  fornecedor_processado?: {
    nome: string;
    cnpj: string;
    status: 'novo' | 'existente';
  };
}

interface ProcessResultSectionProps {
  result: ProcessResult;
  onClose: () => void;
}

const ProcessResultSection: React.FC<ProcessResultSectionProps> = ({ result, onClose }) => {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Processamento concluído com sucesso!</span>
        </div>

        {/* Resumo do Fornecedor */}
        {result.fornecedor_processado && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Building className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Fornecedor</h4>
            </div>
            <div className="text-sm text-blue-800">
              <p><strong>Nome:</strong> {result.fornecedor_processado.nome}</p>
              <p><strong>CNPJ:</strong> {result.fornecedor_processado.cnpj}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                  result.fornecedor_processado.status === 'novo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {result.fornecedor_processado.status === 'novo' ? 'Cadastrado' : 'Já existente'}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Resumo dos Produtos */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Package className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Resumo dos Produtos</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-600 font-medium">{result.novos_produtos.length}</span>
              <span className="text-gray-600 ml-1">produtos criados</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">{result.produtos_atualizados.length}</span>
              <span className="text-gray-600 ml-1">produtos atualizados</span>
            </div>
          </div>
        </div>

        {/* Lista de Produtos Processados */}
        <div className="max-h-64 overflow-y-auto">
          <h4 className="font-medium text-gray-900 mb-2">Produtos processados:</h4>
          <div className="space-y-2">
            {result.produtos_processados.map((produto, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
                <div className="flex-1">
                  <div className="font-medium text-sm">{produto.nome}</div>
                  <div className="text-xs text-gray-500">
                    Código: {produto.codigo} | Quantidade: {produto.quantidade}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {produto.status === 'novo' ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs">Novo</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs">Atualizado</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
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
