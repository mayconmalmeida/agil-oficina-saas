
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

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

      // Simular processamento do XML
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Aqui seria implementada a lógica real de processamento do XML
      // Por enquanto, vamos simular a criação de uma nota fiscal
      const { error } = await supabase
        .from('notas_fiscais')
        .insert({
          user_id: user.id,
          tipo: 'entrada',
          numero: `NFE-${Date.now()}`,
          data_emissao: new Date().toISOString(),
          valor_total: Math.random() * 1000,
          status: 'importado'
        });

      if (error) throw error;

      toast({
        title: "XML importado com sucesso",
        description: "A nota fiscal foi processada e adicionada ao sistema",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
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
