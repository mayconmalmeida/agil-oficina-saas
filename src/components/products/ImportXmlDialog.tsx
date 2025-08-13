
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { parseXmlProducts } from '@/components/products/import/xmlParser';

interface ImportXmlDialogProps {
  onImportSuccess: () => void;
}

interface ProcessResult {
  produtos_processados: Array<{
    nome: string;
    codigo: string;
    quantidade: string;
    status: 'novo' | 'atualizado';
  }>;
  novos_produtos: Array<{
    nome: string;
    codigo: string;
    quantidade: string;
    status: 'novo';
  }>;
}

const ImportXmlDialog: React.FC<ImportXmlDialogProps> = ({ onImportSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/xml' || file.name.endsWith('.xml')) {
        setXmlFile(file);
      } else {
        toast({
          variant: "destructive",
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo XML válido."
        });
      }
    }
  };

  const handleImport = async () => {
    if (!xmlFile) {
      toast({
        variant: "destructive",
        title: "Arquivo não selecionado",
        description: "Por favor, selecione um arquivo XML para importar."
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Você precisa estar logado para importar produtos."
        });
        return;
      }

      // Parse do arquivo XML
      const xmlText = await xmlFile.text();
      const parseResult = parseXmlProducts(xmlText);

      if (parseResult.products.length === 0) {
        toast({
          variant: "destructive",
          title: "Nenhum produto encontrado",
          description: "O arquivo XML não contém produtos válidos."
        });
        return;
      }

      // Se há fornecedor no XML, cadastrar automaticamente
      if (parseResult.supplier) {
        try {
          await supabase
            .from('suppliers')
            .insert({
              user_id: session.user.id,
              name: parseResult.supplier.name,
              cnpj: parseResult.supplier.cnpj,
              email: parseResult.supplier.email,
              phone: parseResult.supplier.phone,
              address: parseResult.supplier.address,
              city: parseResult.supplier.city,
              state: parseResult.supplier.state,
              cep: parseResult.supplier.cep
            });
        } catch (supplierError) {
          console.log('Fornecedor pode já existir:', supplierError);
        }
      }

      // Chamar função RPC do Supabase para processar produtos
      const { data, error } = await supabase.rpc('process_nfce_xml', {
        p_user_id: session.user.id,
        p_produtos: parseResult.products
      });

      if (error) throw error;

      // Type assertion with proper error handling
      const result = data as unknown as ProcessResult;
      
      if (!result || typeof result !== 'object') {
        throw new Error('Resposta inválida do servidor');
      }

      const produtosProcessados = result.produtos_processados || [];
      const novosProdutos = result.novos_produtos || [];
      
      toast({
        title: "Importação concluída",
        description: `${produtosProcessados.length} produtos processados. ${novosProdutos.length} novos produtos adicionados.`
      });

      setIsOpen(false);
      setXmlFile(null);
      onImportSuccess();

    } catch (error: any) {
      console.error('Erro ao importar XML:', error);
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: error.message || "Não foi possível importar o arquivo XML."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Importar XML
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Produtos via XML</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="xml-file">Arquivo XML da NFCe</Label>
            <Input
              id="xml-file"
              type="file"
              accept=".xml,text/xml"
              onChange={handleFileChange}
            />
            <p className="text-sm text-gray-600">
              Selecione um arquivo XML de Nota Fiscal de Consumidor Eletrônica (NFCe)
            </p>
          </div>

          {xmlFile && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">{xmlFile.name}</span>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={!xmlFile || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
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

export default ImportXmlDialog;
