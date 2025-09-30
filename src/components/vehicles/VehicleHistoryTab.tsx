import React, { useState, useEffect } from 'react';
import { Car, History, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { OilChangeLabel } from './OilChangeLabel';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VehicleHistoryTabProps {
  clientId: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleInfo: string;
}

interface HistoricoVeiculo {
  id: string;
  data_troca: string;
  km_atual: number;
  km_proxima?: number;
  tipo_oleo: string;
  observacoes?: string;
  servico_id?: string;
  services?: {
    nome: string;
  } | null;
}

export const VehicleHistoryTab: React.FC<VehicleHistoryTabProps> = ({
  clientId,
  vehicleId,
  vehiclePlate,
  vehicleInfo
}) => {
  const [historicos, setHistoricos] = useState<HistoricoVeiculo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchHistoricos();
  }, [vehicleId]);

  const fetchHistoricos = async () => {
    try {
      const { data, error } = await supabase
        .from('historicos_veiculo')
        .select(`
          *,
          services (nome)
        `)
        .eq('veiculo_id', vehicleId)
        .order('data_troca', { ascending: false });

      if (error) throw error;
      setHistoricos(data as any || []);
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar histórico",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Histórico do Veículo</h3>
        </div>
        <Button onClick={() => setShowLabelDialog(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Gerar Etiqueta de Troca de Óleo
        </Button>
      </div>

      {historicos.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum histórico encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Este veículo ainda não possui histórico de serviços.
            </p>
            <Button onClick={() => setShowLabelDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Entrada
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {historicos.map((historico) => (
            <Card key={historico.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      Troca de Óleo - {historico.tipo_oleo}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(historico.data_troca), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {historico.km_atual.toLocaleString('pt-BR')} km
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">KM Atual</p>
                    <p className="font-medium">{historico.km_atual.toLocaleString('pt-BR')}</p>
                  </div>
                  {historico.km_proxima && (
                    <div>
                      <p className="text-muted-foreground">Próxima Troca</p>
                      <p className="font-medium">{historico.km_proxima.toLocaleString('pt-BR')} km</p>
                    </div>
                  )}
                  {historico.services && (
                    <div>
                      <p className="text-muted-foreground">Serviço</p>
                      <p className="font-medium">{historico.services.nome}</p>
                    </div>
                  )}
                </div>
                {historico.observacoes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-muted-foreground text-sm">Observações</p>
                    <p className="text-sm">{historico.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showLabelDialog && (
        <OilChangeLabel
          clientId={clientId}
          vehicleId={vehicleId}
          vehiclePlate={vehiclePlate}
          vehicleInfo={vehicleInfo}
          onClose={() => setShowLabelDialog(false)}
          onSuccess={() => {
            setShowLabelDialog(false);
            fetchHistoricos();
          }}
        />
      )}
    </div>
  );
};
