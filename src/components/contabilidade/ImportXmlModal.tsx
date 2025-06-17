
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { parseXmlProducts } from '@/components/products/import/xmlParser';

interface ImportXmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportXmlModal: React.FC<ImportXmlModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/xml') {
      setFile(selectedFile);
    } else {
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: "Selecione um arquivo XML válido",
      });
    }
  };

  const processXml = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Ler o arquivo XML
      const xmlText = await file.text();
      
      // Processar o XML e extrair dados
      const { supplier, products } = parseXmlProducts(xmlText);

      let supplierId = null;

      // Cadastrar fornecedor se existir
      if (supplier) {
        // Verificar se fornecedor já existe pelo CNPJ
        const { data: existingSupplier } = await supabase
          .from('fornecedores')
          .select('id')
          .eq('cnpj', supplier.cnpj)
          .eq('user_id', user.id)
          .single();

        if (existingSupplier) {
          supplierId = existingSupplier.id;
          toast({
            title: "Fornecedor existente",
            description: `Fornecedor ${supplier.name} já cadastrado`,
          });
        } else {
          // Criar novo fornecedor
          const { data: newSupplier, error: supplierError } = await supabase
            .from('fornecedores')
            .insert({
              user_id: user.id,
              nome: supplier.name,
              cnpj: supplier.cnpj,
              email: supplier.email,
              telefone: supplier.phone,
              endereco: supplier.address,
              cidade: supplier.city,
              estado: supplier.state,
              cep: supplier.cep
            })
            .select('id')
            .single();

          if (supplierError) throw supplierError;
          supplierId = newSupplier.id;

          toast({
            title: "Fornecedor cadastrado",
            description: `Fornecedor ${supplier.name} cadastrado com sucesso`,
          });
        }
      }

      // Processar produtos
      let produtosCadastrados = 0;
      let produtosAtualizados = 0;

      for (const produto of products) {
        // Verificar se produto já existe pelo código
        const { data: existingProduct } = await supabase
          .from('services')
          .select('id, quantidade_estoque')
          .eq('codigo', produto.codigo)
          .eq('user_id', user.id)
          .eq('tipo', 'produto')
          .single();

        if (existingProduct) {
          // Atualizar estoque do produto existente
          await supabase
            .from('services')
            .update({
              quantidade_estoque: existingProduct.quantidade_estoque + produto.quantidade
            })
            .eq('id', existingProduct.id);
          
          produtosAtualizados++;
        } else {
          // Criar novo produto
          await supabase
            .from('services')
            .insert({
              user_id: user.id,
              nome: produto.nome,
              codigo: produto.codigo,
              tipo: 'produto',
              valor: produto.preco_unitario,
              quantidade_estoque: produto.quantidade,
              preco_custo: produto.preco_unitario,
              is_active: true
            });
          
          produtosCadastrados++;
        }
      }

      // Criar registro da nota fiscal
      const { error: notaError } = await supabase
        .from('notas_fiscais')
        .insert({
          user_id: user.id,
          tipo: 'entrada',
          numero: `NFE-${Date.now()}`,
          data_emissao: new Date().toISOString(),
          valor_total: products.reduce((total, p) => total + (p.preco_unitario * p.quantidade), 0),
          status: 'importado',
          fornecedor_id: supplierId
        });

      if (notaError) throw notaError;

      toast({
        title: "XML importado com sucesso",
        description: `${produtosCadastrados} produtos cadastrados, ${produtosAtualizados} produtos atualizados${supplier ? `, fornecedor ${supplier.name} processado` : ''}`,
      });

      onSuccess();
      onClose();
      setFile(null);
    } catch (error: any) {
      console.error('Erro ao processar XML:', error);
      toast({
        variant: "destructive",
        title: "Erro ao importar XML",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Importar XML</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="xml-file">Selecionar arquivo XML</Label>
            <div className="mt-2">
              <Input
                id="xml-file"
                type="file"
                accept=".xml"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
                className="ml-auto h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={processXml} 
              disabled={!file || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                "Processando..."
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportXmlModal;
