
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, ArrowLeft, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Client {
  id: string;
  nome: string;
  telefone: string;
  veiculo: string;
}

interface Service {
  id: string;
  nome: string;
  valor: number;
}

interface OrdemServico {
  id: string;
  cliente_id: string;
  status: string;
  observacoes: string;
  valor_total: number;
  clients?: {
    nome: string;
    telefone: string;
  };
}

const NewSchedulePage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [ordensAprovadas, setOrdensAprovadas] = useState<OrdemServico[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [criarDeOrdem, setCriarDeOrdem] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    cliente_id: '',
    servico_id: '',
    ordem_servico_id: '',
    data_agendamento: '',
    horario: '',
    observacoes: ''
  });

  useEffect(() => {
    loadClients();
    loadServices();
    loadOrdensAprovadas();
  }, []);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, nome, telefone, veiculo')
        .eq('is_active', true)
        .order('nome');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os clientes."
      });
    }
  };

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, nome, valor')
        .eq('tipo', 'servico')
        .eq('is_active', true)
        .order('nome');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os serviços."
      });
    }
  };

  const loadOrdensAprovadas = async () => {
    try {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          id,
          cliente_id,
          status,
          observacoes,
          valor_total,
          clients:cliente_id(nome, telefone)
        `)
        .eq('status', 'Aprovado')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to fix clients type
      const transformedData = (data || []).map(item => ({
        ...item,
        clients: Array.isArray(item.clients) ? item.clients[0] : item.clients
      }));
      
      setOrdensAprovadas(transformedData);
    } catch (error) {
      console.error('Erro ao carregar ordens aprovadas:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as ordens de serviço aprovadas."
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado."
      });
      return;
    }

    setIsLoading(true);

    try {
      const agendamentoData: any = {
        user_id: user.id,
        data_agendamento: formData.data_agendamento,
        horario: formData.horario,
        observacoes: formData.observacoes,
        status: 'agendado'
      };

      if (criarDeOrdem && formData.ordem_servico_id) {
        // Buscar dados da ordem de serviço selecionada
        const ordemSelecionada = ordensAprovadas.find(ordem => ordem.id === formData.ordem_servico_id);
        if (ordemSelecionada) {
          agendamentoData.cliente_id = ordemSelecionada.cliente_id;
          agendamentoData.observacoes = `Agendamento criado a partir da Ordem de Serviço #${ordemSelecionada.id.slice(-8)}. ${formData.observacoes}`.trim();
        }
      } else {
        agendamentoData.cliente_id = formData.cliente_id;
        agendamentoData.servico_id = formData.servico_id;
      }

      const { error } = await supabase
        .from('agendamentos')
        .insert(agendamentoData);

      if (error) throw error;

      toast({
        title: "Agendamento criado",
        description: "O agendamento foi criado com sucesso.",
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
        <Button variant="ghost" onClick={() => navigate('/agenda')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">Novo Agendamento</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Dados do Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Opção para criar a partir de ordem de serviço */}
            <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
              <Checkbox
                id="criar-de-ordem"
                checked={criarDeOrdem}
                onCheckedChange={(checked) => {
                  setCriarDeOrdem(checked as boolean);
                  if (!checked) {
                    setFormData({...formData, ordem_servico_id: ''});
                  }
                }}
              />
              <Label htmlFor="criar-de-ordem" className="flex items-center cursor-pointer">
                <FileText className="h-4 w-4 mr-2" />
                Criar agendamento a partir de uma Ordem de Serviço Aprovada
              </Label>
            </div>

            {criarDeOrdem && (
              <div>
                <Label htmlFor="ordem_servico_id">Ordem de Serviço Aprovada</Label>
                <Select 
                  onValueChange={(value) => setFormData({...formData, ordem_servico_id: value})} 
                  required={criarDeOrdem}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma ordem de serviço aprovada" />
                  </SelectTrigger>
                  <SelectContent>
                    {ordensAprovadas.map((ordem) => (
                      <SelectItem key={ordem.id} value={ordem.id}>
                        <div>
                          <div className="font-medium">
                            OS #{ordem.id.slice(-8)} - {ordem.clients?.nome}
                          </div>
                          <div className="text-sm text-gray-500">
                            Valor: R$ {ordem.valor_total.toFixed(2)}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!criarDeOrdem && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="cliente_id">Cliente</Label>
                  <Select onValueChange={(value) => setFormData({...formData, cliente_id: value})} required={!criarDeOrdem}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <div>
                            <div className="font-medium">{client.nome}</div>
                            <div className="text-sm text-gray-500">
                              {client.telefone} - {client.veiculo}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="servico_id">Serviço</Label>
                  <Select onValueChange={(value) => setFormData({...formData, servico_id: value})} required={!criarDeOrdem}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div>
                            <div className="font-medium">{service.nome}</div>
                            <div className="text-sm text-gray-500">
                              R$ {service.valor.toFixed(2)}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="data_agendamento">Data do Agendamento</Label>
                <Input
                  id="data_agendamento"
                  type="date"
                  value={formData.data_agendamento}
                  onChange={(e) => setFormData({...formData, data_agendamento: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <Label htmlFor="horario">Horário</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="horario"
                    type="time"
                    value={formData.horario}
                    onChange={(e) => setFormData({...formData, horario: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                placeholder="Observações adicionais sobre o agendamento..."
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/agenda')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Criar Agendamento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewSchedulePage;
