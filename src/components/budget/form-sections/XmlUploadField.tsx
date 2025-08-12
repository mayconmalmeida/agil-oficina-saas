
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { parseXmlProducts } from '@/components/products/import/xmlParser';

interface XmlUploadFieldProps {
  onProductsImported?: (products: any[]) => void;
  onSupplierImported?: (supplier: any) => void;
}

const XmlUploadField: React.FC<XmlUploadFieldProps> = ({ 
  onProductsImported, 
  onSupplierImported 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/xml' || selectedFile.name.endsWith('.xml')) {
        setFile(selectedFile);
      } else {
        toast({
          variant: "destructive",
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo XML válido.",
        });
      }
    }
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
      const { supplier, products } = parseXmlProducts(xmlText);
      
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

      // Processar fornecedor se existir
      if (supplier && onSupplierImported) {
        onSupplierImported(supplier);
      }

      // Processar produtos
      if (onProductsImported) {
        onProductsImported(products);
      }
      
      toast({
        title: "XML processado com sucesso",
        description: `${products.length} produtos foram importados.`,
      });

      // Limpar arquivo após processamento
      setFile(null);
      
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

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="space-y-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        <Label className="text-sm font-medium">Importar XML da Nota Fiscal</Label>
      </div>
      
      <div className="space-y-3">
        <div>
          <Input
            type="file"
            accept=".xml"
            onChange={handleFileChange}
            className="bg-white"
          />
          {file && (
            <div className="flex items-center justify-between mt-2 p-2 bg-blue-50 rounded border">
              <span className="text-sm text-blue-700">
                Arquivo selecionado: {file.name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <Button
          type="button"
          onClick={processXml}
          disabled={!file || isProcessing}
          variant="outline"
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Processando XML...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Importar Produtos e Fornecedor
            </>
          )}
        </Button>
      </div>
      
      <p className="text-xs text-gray-600">
        Importe produtos e fornecedores automaticamente a partir de um arquivo XML de nota fiscal.
      </p>
    </div>
  );
};

export default XmlUploadField;
