
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye, EyeOff, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface AlertaEstoque {
  id: string;
  produto_id: string;
  tipo_alerta: string;
  visualizado: boolean;
  created_at: string;
  services?: {
    nome: string;
    quantidade_estoque: number;
    estoque_minimo: number;
  };
}

const AlertasEstoque: React.FC = () => {
  const [alertas, setAlertas] = useState<AlertaEstoque[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAlertas();
  }, [user?.id]);

  const fetchAlertas = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('alertas_estoque')
        .select(`
          *,
          services:produto_id(nome, quantidade_estoque, estoque_minimo)
        `)
        .eq('user_id', user.id)
        .eq('visualizado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlertas(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar alertas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const marcarComoVisualizado = async (alertaId: string) => {
    try {
      const { error } = await supabase
        .from('alertas_estoque')
        .update({ visualizado: true })
        .eq('id', alertaId);

      if (error) throw error;

      setAlertas(prev => prev.filter(alerta => alerta.id !== alertaId));
      
      toast({
        title: "Alerta marcado como visualizado",
        description: "O alerta foi removido da lista.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alertas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Estoque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Nenhum alerta de estoque no momento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Alertas de Estoque ({alertas.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alertas.map((alerta) => (
          <div
            key={alerta.id}
            className="flex items-center justify-between p-3 border rounded-lg bg-amber-50 border-amber-200"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  Estoque Baixo
                </Badge>
                <span className="font-medium text-sm">
                  {alerta.services?.nome}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Estoque atual: {alerta.services?.quantidade_estoque} | 
                Mínimo: {alerta.services?.estoque_minimo}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => marcarComoVisualizado(alerta.id)}
              title="Marcar como visualizado"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AlertasEstoque;
