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

interface Oficina {
  logo_url: string | null;
  nome_oficina: string;
  telefone: string | null;
  cidade: string | null;
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
    km_proxima_oleo_motor: '',
    km_proxima_oleo_cambio: '',
    km_proxima_filtro_oleo: '',
    km_proxima_filtro_ar: '',
    km_proxima_filtro_combustivel: '',
    marca_modelo_oleo: '',
    observacoes: ''
  });
  const [client, setClient] = useState<Client | null>(null);
  const [oficina, setOficina] = useState<Oficina | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchClient();
    fetchOficina();
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

  const fetchOficina = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('logo_url, nome_oficina, telefone, cidade')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setOficina(data);
    } catch (error: any) {
      console.error('Erro ao carregar oficina:', error);
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
          km_proxima: formData.km_proxima_oleo_motor ? parseInt(formData.km_proxima_oleo_motor) : null,
          tipo_oleo: formData.marca_modelo_oleo,
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
    const frontContent = document.getElementById('oil-change-label-front');
    const backContent = document.getElementById('oil-change-label');
    
    if (frontContent && backContent) {
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
                  width: 10cm; 
                  height: 7cm; 
                  border: 2px solid #000; 
                  padding: 12px; 
                  box-sizing: border-box;
                  background: white;
                  display: flex;
                  margin-bottom: 20px;
                  page-break-after: always;
                }
                .front-label {
                  width: 10cm; 
                  height: 7cm; 
                  border: 2px solid #000; 
                  padding: 12px; 
                  box-sizing: border-box;
                  background: white;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  margin-bottom: 20px;
                  page-break-after: always;
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
                  .label, .front-label { 
                    width: 10cm; 
                    height: 7cm; 
                    border: 2px solid #000;
                  }
                }
              </style>
            </head>
            <body>
              <div class="front-label">${frontContent.innerHTML}</div>
              <div class="label">${backContent.innerHTML}</div>
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
              <Label htmlFor="marca_modelo_oleo">Marca/Modelo do Óleo</Label>
              <Input
                id="marca_modelo_oleo"
                placeholder="Ex: Castrol GTX 20W50"
                value={formData.marca_modelo_oleo}
                onChange={(e) => setFormData(prev => ({ ...prev, marca_modelo_oleo: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="km_proxima_oleo_motor">KM Próxima - Óleo Motor</Label>
                <Input
                  id="km_proxima_oleo_motor"
                  type="number"
                  placeholder="125450"
                  value={formData.km_proxima_oleo_motor}
                  onChange={(e) => setFormData(prev => ({ ...prev, km_proxima_oleo_motor: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="km_proxima_oleo_cambio">KM Próxima - Óleo Câmbio</Label>
                <Input
                  id="km_proxima_oleo_cambio"
                  type="number"
                  placeholder="125450"
                  value={formData.km_proxima_oleo_cambio}
                  onChange={(e) => setFormData(prev => ({ ...prev, km_proxima_oleo_cambio: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="km_proxima_filtro_oleo">KM Filtro Óleo</Label>
                <Input
                  id="km_proxima_filtro_oleo"
                  type="number"
                  placeholder="125450"
                  value={formData.km_proxima_filtro_oleo}
                  onChange={(e) => setFormData(prev => ({ ...prev, km_proxima_filtro_oleo: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="km_proxima_filtro_ar">KM Filtro Ar</Label>
                <Input
                  id="km_proxima_filtro_ar"
                  type="number"
                  placeholder="125450"
                  value={formData.km_proxima_filtro_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, km_proxima_filtro_ar: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="km_proxima_filtro_combustivel">KM Filtro Combustível</Label>
                <Input
                  id="km_proxima_filtro_combustivel"
                  type="number"
                  placeholder="125450"
                  value={formData.km_proxima_filtro_combustivel}
                  onChange={(e) => setFormData(prev => ({ ...prev, km_proxima_filtro_combustivel: e.target.value }))}
                />
              </div>
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
                disabled={!formData.km_atual || !formData.marca_modelo_oleo || isLoading}
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
              {/* Lado 1 - Frente da etiqueta */}
              <div id="oil-change-label-front" className="w-[10cm] h-[7cm] border-2 border-black p-4 bg-white text-black flex flex-col items-center justify-center mb-4">
                {/* Logo da Oficina */}
                <div className="text-center mb-4">
                  {oficina?.logo_url ? (
                    <img 
                      src={oficina.logo_url} 
                      alt="Logo da Oficina" 
                      className="h-16 w-auto object-contain mb-2"
                    />
                  ) : (
                    <div className="font-bold text-xl mb-2 text-center">
                      {oficina?.nome_oficina || 'AUTO MECÂNICA'}
                    </div>
                  )}
                </div>
                
                {/* Telefone */}
                <div className="text-center text-lg font-semibold mb-2">
                  {oficina?.telefone || '(00) 0000-0000'}
                </div>
                
                {/* Cidade */}
                <div className="text-center text-md">
                  {oficina?.cidade || 'CIDADE - ESTADO'}
                </div>
              </div>

              {/* Lado 2 - Verso da etiqueta */}
              <div id="oil-change-label" className="w-[10cm] h-[7cm] border-2 border-black p-3 bg-white text-black flex">
                {/* Lado esquerdo - Informações */}
                <div className="flex-1 pr-3">
                  {/* Header com logo pequeno */}
                  <div className="text-center mb-2 pb-1 border-b border-black">
                    <div className="text-xs font-bold">
                      {oficina?.nome_oficina || 'AUTO MECÂNICA'}
                    </div>
                    <div className="text-xs">
                      {oficina?.telefone || '(00) 0000-0000'}
                    </div>
                  </div>
                  
                  {/* Última troca de óleo */}
                  <div className="mb-2">
                    <div className="text-xs font-bold mb-1">Última troca de óleo:</div>
                    <div className="text-xs flex justify-between">
                      <span>DATA: {format(new Date(formData.data_troca), 'dd/MM/yyyy')}</span>
                      <span>AOS {parseInt(formData.km_atual || '0').toLocaleString('pt-BR')} KM</span>
                    </div>
                  </div>

                  {/* Próxima troca */}
                  <div className="mb-1">
                    <div className="text-xs font-bold mb-1 text-center bg-black text-white px-1">
                      PRÓXIMAS TROCAS
                    </div>
                    
                    <div className="text-xs space-y-0.5">
                      <div className="flex justify-between border-b border-gray-300">
                        <span className="font-medium">Marca/Modelo do Óleo:</span>
                        <span>{formData.marca_modelo_oleo || '_________________'}</span>
                      </div>
                      
                      <div className="flex justify-between border-b border-gray-300">
                        <span className="font-medium">Motor:</span>
                        <span>
                          {formData.km_proxima_oleo_motor ? 
                            `${parseInt(formData.km_proxima_oleo_motor).toLocaleString('pt-BR')} KM` : 
                            '_________________'
                          }
                        </span>
                      </div>
                      
                      <div className="flex justify-between border-b border-gray-300">
                        <span className="font-medium">Câmbio:</span>
                        <span>
                          {formData.km_proxima_oleo_cambio ? 
                            `${parseInt(formData.km_proxima_oleo_cambio).toLocaleString('pt-BR')} KM` : 
                            '_________________'
                          }
                        </span>
                      </div>
                      
                      <div className="flex justify-between border-b border-gray-300">
                        <span className="font-medium">Diferencial:</span>
                        <span>_________________</span>
                      </div>
                      
                      <div className="flex justify-between border-b border-gray-300">
                        <span className="font-medium">Filtro Ar:</span>
                        <span>
                          {formData.km_proxima_filtro_ar ? 
                            `${parseInt(formData.km_proxima_filtro_ar).toLocaleString('pt-BR')} KM` : 
                            '_________________'
                          }
                        </span>
                      </div>
                      
                      <div className="flex justify-between border-b border-gray-300">
                        <span className="font-medium">Comb.:</span>
                        <span>
                          {formData.km_proxima_filtro_combustivel ? 
                            `${parseInt(formData.km_proxima_filtro_combustivel).toLocaleString('pt-BR')} KM` : 
                            '_________________'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lado direito - QR Code */}
                <div className="w-16 flex flex-col justify-center items-center border-l border-black pl-2">
                  <QRCodeSVG value={qrCodeUrl} size={55} />
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