import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { parseXmlProducts } from './import/xmlParser';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ImportXMLButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.name.toLowerCase().endsWith('.xml')) {
      toast({
        variant: "destructive",
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo XML válido.",
      });
      return;
    }

    setIsProcessing(true);
    setImportResults(null);

    try {
      const xmlText = await file.text();
      const parsedData = parseXmlProducts(xmlText);
      
      if (parsedData.products.length === 0) {
        throw new Error('Nenhum produto encontrado no XML');
      }

      // Criar fornecedor se não existir
      let supplierId = null;
      if (parsedData.supplier) {
        const { data: existingSupplier } = await supabase
          .from('suppliers')
          .select('id')
          .eq('cnpj', parsedData.supplier.cnpj)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingSupplier) {
          supplierId = existingSupplier.id;
        } else {
          const { data: newSupplier, error: supplierError } = await supabase
            .from('suppliers')
            .insert({
              user_id: user.id,
              name: parsedData.supplier.name,
              cnpj: parsedData.supplier.cnpj,
              email: parsedData.supplier.email,
              phone: parsedData.supplier.phone,
              address: parsedData.supplier.address,
              city: parsedData.supplier.city,
              state: parsedData.supplier.state,
              cep: parsedData.supplier.cep
            })
            .select('id')
            .single();

          if (supplierError) throw supplierError;
          supplierId = newSupplier.id;
        }
      }

      // Processar produtos
      const results = {
        processedProducts: [],
        newProducts: [],
        updatedProducts: [],
        errors: []
      };

      for (const product of parsedData.products) {
        try {
          // Verificar se produto já existe
          const { data: existingProduct } = await supabase
            .from('services')
            .select('*')
            .eq('user_id', user.id)
            .eq('codigo', product.codigo)
            .eq('tipo', 'produto')
            .maybeSingle();

          if (existingProduct) {
            // Atualizar estoque do produto existente
            const { error: updateError } = await supabase
              .from('services')
              .update({
                quantidade_estoque: existingProduct.quantidade_estoque + product.quantidade,
                preco_custo: product.preco_unitario,
                valor: product.preco_unitario
              })
              .eq('id', existingProduct.id);

            if (updateError) throw updateError;

            // Registrar movimentação de estoque
            await supabase
              .from('movimentacao_estoque')
              .insert({
                user_id: user.id,
                produto_id: existingProduct.id,
                tipo_movimentacao: 'entrada',
                quantidade: product.quantidade,
                quantidade_anterior: existingProduct.quantidade_estoque,
                quantidade_atual: existingProduct.quantidade_estoque + product.quantidade,
                motivo: `Importação XML - NF: ${parsedData.numeroNota}`
              });

            results.updatedProducts.push({
              nome: product.nome,
              codigo: product.codigo,
              quantidade: product.quantidade
            });
          } else {
            // Criar novo produto
            const { data: newProduct, error: productError } = await supabase
              .from('services')
              .insert({
                user_id: user.id,
                nome: product.nome,
                codigo: product.codigo,
                tipo: 'produto',
                valor: product.preco_unitario,
                quantidade_estoque: product.quantidade,
                preco_custo: product.preco_unitario,
                estoque_minimo: 5, // Valor padrão
                is_active: true
              })
              .select('id')
              .single();

            if (productError) throw productError;

            // Registrar movimentação de estoque inicial
            await supabase
              .from('movimentacao_estoque')
              .insert({
                user_id: user.id,
                produto_id: newProduct.id,
                tipo_movimentacao: 'entrada',
                quantidade: product.quantidade,
                quantidade_anterior: 0,
                quantidade_atual: product.quantidade,
                motivo: `Importação XML - NF: ${parsedData.numeroNota}`
              });

            results.newProducts.push({
              nome: product.nome,
              codigo: product.codigo,
              quantidade: product.quantidade
            });
          }

          results.processedProducts.push(product);
        } catch (error: any) {
          results.errors.push({
            product: product.nome,
            error: error.message
          });
        }
      }

      setImportResults(results);
      
      toast({
        title: "Importação concluída",
        description: `${results.processedProducts.length} produtos processados com sucesso.`,
      });

    } catch (error: any) {
      console.error('Erro na importação XML:', error);
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: error.message || "Erro ao processar o arquivo XML.",
      });
    } finally {
      setIsProcessing(false);
      // Limpar o input
      event.target.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Importar XML
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Importar Produtos via XML
          </DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo XML de nota fiscal para importar produtos automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Selecionar Arquivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".xml"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="cursor-pointer"
                />
                {isProcessing && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Processando...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {importResults && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Resultado da Importação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {importResults.newProducts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">
                      Novos Produtos ({importResults.newProducts.length})
                    </h4>
                    <div className="space-y-1 text-sm">
                      {importResults.newProducts.map((product: any, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span>{product.nome} ({product.codigo})</span>
                          <span className="text-muted-foreground">+{product.quantidade}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {importResults.updatedProducts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-600 mb-2">
                      Produtos Atualizados ({importResults.updatedProducts.length})
                    </h4>
                    <div className="space-y-1 text-sm">
                      {importResults.updatedProducts.map((product: any, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span>{product.nome} ({product.codigo})</span>
                          <span className="text-muted-foreground">+{product.quantidade}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {importResults.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Erros ({importResults.errors.length})
                    </h4>
                    <div className="space-y-1 text-sm">
                      {importResults.errors.map((error: any, index: number) => (
                        <div key={index} className="text-red-600">
                          {error.product}: {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportXMLButton;
