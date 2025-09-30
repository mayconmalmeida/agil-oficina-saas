import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Service {
  id: string;
  nome: string;
  codigo?: string;
  tipo: string;
  valor: number;
  descricao?: string;
  is_active: boolean;
}

const ServiceEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [service, setService] = useState<Service>({
    id: '',
    nome: '',
    codigo: '',
    tipo: 'servico',
    valor: 0,
    descricao: '',
    is_active: true
  });

  useEffect(() => {
    if (id && id !== 'novo') {
      fetchService();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const fetchService = async () => {
    if (!id || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setService(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar serviço",
        description: error.message,
      });
      navigate('/servicos');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const numericValue = parseInt(numbers, 10);
    if (numericValue < 100) {
      return `0,${numbers.padStart(2, '0')}`;
    }
    const reais = Math.floor(numericValue / 100);
    const centavos = numericValue % 100;
    const reaisFormatted = reais.toLocaleString('pt-BR');
    return `${reaisFormatted},${centavos.toString().padStart(2, '0')}`;
  };

  const parseCurrencyToNumber = (currencyString: string) => {
    const numbers = currencyString.replace(/\D/g, '');
    if (!numbers) return 0;
    return parseInt(numbers, 10) / 100;
  };

  const handleSave = async () => {
    if (!service.nome.trim()) {
      toast({
        variant: "destructive",
        title: "Nome obrigatório",
        description: "O nome do serviço é obrigatório.",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (id === 'novo') {
        const { error } = await supabase
          .from('services')
          .insert({
            ...service,
            user_id: user?.id,
            tipo: 'servico'
          });

        if (error) throw error;

        toast({
          title: "Serviço criado",
          description: "O serviço foi criado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('services')
          .update(service)
          .eq('id', id)
          .eq('user_id', user?.id);

        if (error) throw error;

        toast({
          title: "Serviço atualizado",
          description: "O serviço foi atualizado com sucesso.",
        });
      }

      navigate('/servicos');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar serviço",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/servicos')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">
          {id === 'novo' ? 'Novo Serviço' : 'Editar Serviço'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Serviço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Serviço *</Label>
              <Input
                id="nome"
                value={service.nome}
                onChange={(e) => setService({...service, nome: e.target.value})}
                placeholder="Nome do serviço"
              />
            </div>
            <div>
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={service.codigo || ''}
                onChange={(e) => setService({...service, codigo: e.target.value})}
                placeholder="Código do serviço"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              value={formatCurrency((service.valor * 100).toString())}
              onChange={(e) => setService({...service, valor: parseCurrencyToNumber(e.target.value)})}
              placeholder="0,00"
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={service.descricao || ''}
              onChange={(e) => setService({...service, descricao: e.target.value})}
              placeholder="Descrição do serviço"
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={service.is_active}
              onCheckedChange={(checked) => setService({...service, is_active: checked})}
            />
            <Label htmlFor="is_active">Serviço ativo</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/servicos')}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceEditPage;
