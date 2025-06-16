
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import ImportXmlHeader from './import/ImportXmlHeader';
import FileUploadSection from './import/FileUploadSection';
import ProcessResultSection from './import/ProcessResultSection';
import { parseXmlProducts, ParsedSupplier, ParsedProduct } from './import/xmlParser';

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
  fornecedor_processado?: {
    nome: string;
    cnpj: string;
    status: 'novo' | 'existente';
  };
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

  const processSupplier = async (supplier: ParsedSupplier, userId: string) => {
    // Verificar se o fornecedor já existe pelo CNPJ
    const { data: existingSupplier } = await supabase
      .from('suppliers')
      .select('id, name')
      .eq('user_id', userId)
      .eq('cnpj', supplier.cnpj)
      .maybeSingle();

    if (existingSupplier) {
      return {
        nome: existingSupplier.name,
        cnpj: supplier.cnpj,
        status: 'existente' as const
      };
    }

    // Criar novo fornecedor
    const { error } = await supabase
      .from('suppliers')
      .insert({
        user_id: userId,
        name: supplier.name,
        cnpj: supplier.cnpj,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        city: supplier.city,
        state: supplier.state,
        cep: supplier.cep
      });

    if (error) {
      console.error('Erro ao criar fornecedor:', error);
      throw new Error('Erro ao cadastrar fornecedor');
    }

    return {
      nome: supplier.name,
      cnpj: supplier.cnpj,
      status: 'novo' as const
    };
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

      let fornecedorProcessado = undefined;

      // Processar fornecedor se existir
      if (supplier) {
        try {
          fornecedorProcessado = await processSupplier(supplier, user.id);
        } catch (error: any) {
          console.warn('Erro ao processar fornecedor:', error);
          // Continuar mesmo se der erro no fornecedor
        }
      }

      // Processar produtos
      const { data, error } = await supabase.rpc('process_nfce_xml', {
        p_user_id: user.id,
        p_produtos: products
      });

      if (error) throw error;

      const processedResult = data as unknown as ProcessResult;
      
      // Adicionar informação do fornecedor ao resultado
      if (fornecedorProcessado) {
        processedResult.fornecedor_processado = fornecedorProcessado;
      }
      
      setResult(processedResult);
      
      const message = fornecedorProcessado 
        ? `${processedResult.produtos_processados.length} produtos e 1 fornecedor foram processados.`
        : `${processedResult.produtos_processados.length} produtos foram processados.`;
      
      toast({
        title: "XML processado com sucesso",
        description: message,
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <ImportXmlHeader />
        
        <div className="space-y-6">
          {!result ? (
            <FileUploadSection
              file={file}
              isProcessing={isProcessing}
              onFileChange={handleFileChange}
              onProcess={processXml}
              onCancel={handleClose}
            />
          ) : (
            <ProcessResultSection
              result={result}
              onClose={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportXmlModal;
