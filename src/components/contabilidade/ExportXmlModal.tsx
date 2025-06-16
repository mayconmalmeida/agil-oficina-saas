
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integracaoContabilService } from '@/services/integracaoContabilService';

interface ExportXmlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportXmlModal: React.FC<ExportXmlModalProps> = ({ isOpen, onClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeEntrada, setIncludeEntrada] = useState(true);
  const [includeSaida, setIncludeSaida] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Datas obrigatórias",
        description: "Selecione o período para exportação",
      });
      return;
    }

    setIsExporting(true);
    try {
      const options = {
        startDate,
        endDate,
        format: 'xml' as const,
        includeOrcamentos: false,
        includeClientes: false,
        includeServicos: false
      };

      const blob = await integracaoContabilService.exportarDados(options);
      integracaoContabilService.downloadFile(blob, `notas_fiscais_${startDate}_${endDate}.xml`);

      toast({
        title: "Exportação concluída",
        description: "Arquivo XML baixado com sucesso",
      });

      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro na exportação",
        description: error.message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar XMLs</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start-date">Data inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">Data final</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Incluir nos XMLs:</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="entrada"
                  checked={includeEntrada}
                  onCheckedChange={setIncludeEntrada}
                />
                <Label htmlFor="entrada">Notas de Entrada</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="saida"
                  checked={includeSaida}
                  onCheckedChange={setIncludeSaida}
                />
                <Label htmlFor="saida">Notas de Saída</Label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? (
                "Exportando..."
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportXmlModal;
