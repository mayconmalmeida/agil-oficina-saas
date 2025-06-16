
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import ImportXmlHeader from './import/ImportXmlHeader';
import FileUploadSection from './import/FileUploadSection';
import ProcessResultSection from './import/ProcessResultSection';
import { parseXmlProducts } from './import/xmlParser';

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

      // Safe type conversion with proper unknown intermediate step
      const processedResult = data as unknown as ProcessResult;
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
