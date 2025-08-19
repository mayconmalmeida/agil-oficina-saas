
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  nome: string;
}

interface Service {
  id: string;
  nome: string;
}

const NewSchedulePage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    data_agendamento: '',
    horario: '',
    cliente_id: '',
    servico_id: '',
    observacoes: ''
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Carregar clientes
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, nome')
        .eq('is_active', true);

      if (clientsError) throw clientsError;

      // Carregar serviços
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, nome')
        .eq('is_active', true);

      if (servicesError) throw servicesError;

      setClients(clientsData || []);
      setServices(servicesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados necessários."
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('agendamentos')
        .insert({
          data_agendamento: formData.data_agendamento,
          horario: formData.horario,
          cliente_id: formData.cliente_id,
          servico_id: formData.servico_id,
          observacoes: formData.observacoes,
          status: 'agendado'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso!"
      });

      navigate('/agenda');
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar o agendamento."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/agenda')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex items-center space-x-2">
          <Calendar className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Novo Agendamento</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Agendamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_agendamento">Data</Label>
                <Input
                  id="data_agendamento"
                  type="date"
                  value={formData.data_agendamento}
                  onChange={(e) => setFormData({...formData, data_agendamento: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="horario">Horário</Label>
                <Input
                  id="horario"
                  type="time"
                  value={formData.horario}
                  onChange={(e) => setFormData({...formData, horario: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cliente_id">Cliente</Label>
                <Select onValueChange={(value) => setFormData({...formData, cliente_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="servico_id">Serviço</Label>
                <Select onValueChange={(value) => setFormData({...formData, servico_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Digite observações sobre o agendamento..."
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => navigate('/agenda')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Salvando...' : 'Salvar Agendamento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewSchedulePage;
