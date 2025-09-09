import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';

interface OilChangeLabelProps {
  clientId: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleInfo: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Client {
  nome: string;
}

const oilTypes = [
  '5W30',
  '5W40',
  '10W30',
  '10W40',
  '15W40',
  '20W50',
  'Sintético',
  'Semi-sintético',
  'Mineral'
];

export const OilChangeLabel: React.FC<OilChangeLabelProps> = ({
  clientId,
  vehicleId,
  vehiclePlate,
  vehicleInfo,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    data_troca: format(new Date(), 'yyyy-MM-dd'),
    km_atual: '',
    km_proxima: '',
    tipo_oleo: '',
    observacoes: ''
  });
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  const fetchClient = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('nome')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      setClient(data);
    } catch (error: any) {
      console.error('Erro ao carregar cliente:', error);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Gerar URL do QR Code
      const qrUrl = `${window.location.origin}/historico/${vehiclePlate.replace('-', '')}`;
      
      const { error } = await supabase
        .from('historicos_veiculo')
        .insert({
          user_id: user.id,
          cliente_id: clientId,
          veiculo_id: vehicleId,
          data_troca: formData.data_troca,
          km_atual: parseInt(formData.km_atual),
          km_proxima: formData.km_proxima ? parseInt(formData.km_proxima) : null,
          tipo_oleo: formData.tipo_oleo,
          observacoes: formData.observacoes,
          qrcode_url: qrUrl
        });

      if (error) throw error;

      setQrCodeUrl(qrUrl);
      setStep(2);

      toast({
        title: "Sucesso!",
        description: "Etiqueta criada com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao criar etiqueta:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar etiqueta",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('oil-change-label');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Etiqueta de Troca de Óleo</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  font-family: Arial, sans-serif; 
                  background: white;
                }
                .label { 
                  width: 7cm; 
                  height: 5cm; 
                  border: 2px solid #000; 
                  padding: 10px; 
                  box-sizing: border-box;
                  background: white;
                }
                .header { 
                  text-align: center; 
                  font-weight: bold; 
                  font-size: 18px; 
                  margin-bottom: 8px;
                  border-bottom: 1px solid #000;
                  padding-bottom: 5px;
                }
                .content { 
                  font-size: 12px; 
                  line-height: 1.3;
                }
                .row { 
                  display: flex; 
                  justify-content: space-between; 
                  margin-bottom: 3px;
                }
                .qr-container { 
                  text-align: center; 
                  margin-top: 8px;
                }
                @media print {
                  body { margin: 0; }
                  .label { 
                    width: 7cm; 
                    height: 5cm; 
                    border: 2px solid #000;
                  }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (step === 1) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gerar Etiqueta de Troca de Óleo</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="data_troca">Data da Troca</Label>
              <Input
                id="data_troca"
                type="date"
                value={formData.data_troca}
                onChange={(e) => setFormData(prev => ({ ...prev, data_troca: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="km_atual">KM Atual</Label>
              <Input
                id="km_atual"
                type="number"
                placeholder="Ex: 120450"
                value={formData.km_atual}
                onChange={(e) => setFormData(prev => ({ ...prev, km_atual: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="km_proxima">KM Próxima Troca (opcional)</Label>
              <Input
                id="km_proxima"
                type="number"
                placeholder="Ex: 125450"
                value={formData.km_proxima}
                onChange={(e) => setFormData(prev => ({ ...prev, km_proxima: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="tipo_oleo">Tipo do Óleo</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_oleo: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de óleo" />
                </SelectTrigger>
                <SelectContent>
                  {oilTypes.map((oil) => (
                    <SelectItem key={oil} value={oil}>{oil}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                placeholder="Informações adicionais..."
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!formData.km_atual || !formData.tipo_oleo || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Gerando...' : 'Gerar Etiqueta'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Etiqueta de Troca de Óleo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="w-fit mx-auto">
            <CardContent className="p-0">
              <div id="oil-change-label" className="w-[7cm] h-[5cm] border-2 border-black p-2 bg-white text-black">
                <div className="text-center font-bold text-lg border-b border-black pb-1 mb-2">
                  Oficina Go
                </div>
                
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Veículo:</span>
                    <span className="font-medium">{vehicleInfo} {vehiclePlate}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Cliente:</span>
                    <span className="font-medium">{client?.nome}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Óleo:</span>
                    <span className="font-medium">{formData.tipo_oleo}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Data:</span>
                    <span className="font-medium">
                      {format(new Date(formData.data_troca), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>KM:</span>
                    <span className="font-medium">
                      {parseInt(formData.km_atual).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  
                  {formData.km_proxima && (
                    <div className="flex justify-between">
                      <span>Próx. Troca:</span>
                      <span className="font-medium">
                        {parseInt(formData.km_proxima).toLocaleString('pt-BR')} km
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-center mt-2">
                  <QRCodeSVG value={qrCodeUrl} size={60} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Fechar
            </Button>
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={onSuccess} className="flex-1">
              Concluir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};