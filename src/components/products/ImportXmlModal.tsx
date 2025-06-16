
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, PlusCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface ImportXmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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

const ImportXmlModal: React.FC<ImportXmlModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/xml' || selectedFile.name.endsWith('.xml')) {
        setFile(selectedFile);
        setResult(null);
      } else {
        toast({
          variant: "destructive",
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo XML válido.",
        });
      }
    }
  };

  const parseXmlProducts = (xmlText: string): any[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const products: any[] = [];
    const detElements = xmlDoc.getElementsByTagName('det');
    
    for (let i = 0; i < detElements.length; i++) {
      const det = detElements[i];
      const prod = det.getElementsByTagName('prod')[0];
      
      if (prod) {
        const cProd = prod.getElementsByTagName('cProd')[0]?.textContent || '';
        const xProd = prod.getElementsByTagName('xProd')[0]?.textContent || '';
        const qCom = prod.getElementsByTagName('qCom')[0]?.textContent || '0';
        const vUnCom = prod.getElementsByTagName('vUnCom')[0]?.textContent || '0';
        
        if (cProd && xProd) {
          products.push({
            codigo: cProd,
            nome: xProd,
            quantidade: parseInt(qCom) || 0,
            preco_unitario: parseFloat(vUnCom) || 0
          });
        }
      }
    }
    
    return products;
  };

  const processXml = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo XML para processar.",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const xmlText = await file.text();
      const products = parseXmlProducts(xmlText);
      
      if (products.length === 0) {
        toast({
          variant: "destructive",
          title: "Nenhum produto encontrado",
          description: "O arquivo XML não contém produtos válidos.",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.rpc('process_nfce_xml', {
        p_user_id: user.id,
        p_produtos: products
      });

      if (error) throw error;

      // Type assertion para tratar o retorno Json do Supabase
      const processedResult = data as ProcessResult;
      setResult(processedResult);
      
      toast({
        title: "XML processado com sucesso",
        description: `${processedResult.produtos_processados.length} produtos foram processados.`,
      });

      onSuccess();
      
    } catch (error: any) {
      console.error('Error processing XML:', error);
      toast({
        variant: "destructive",
        title: "Erro ao processar XML",
        description: error.message || "Não foi possível processar o arquivo XML.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Nota (XML) - NFC-e</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!result ? (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="xml-file">Arquivo XML da NFC-e</Label>
                  <Input
                    id="xml-file"
                    type="file"
                    accept=".xml"
                    onChange={handleFileChange}
                    className="mt-1"
                  />
                  {file && (
                    <p className="text-sm text-gray-600 mt-2">
                      Arquivo selecionado: {file.name}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button onClick={processXml} disabled={!file || isProcessing}>
                  {isProcessing ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Processar Nota
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
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
                <Button onClick={handleClose}>
                  Fechar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportXmlModal;
