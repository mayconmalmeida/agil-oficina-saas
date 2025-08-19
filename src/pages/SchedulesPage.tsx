import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import CalendarioInterativo from '@/components/scheduling/CalendarioInterativo';

const SchedulesPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Carregar dados do banco
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Carregar agendamentos
      const { data: agendamentosData, error: agendamentosError } = await supabase
        .from('agendamentos')
        .select(`
          *,
          clients(id, nome, telefone),
          services(id, nome)
        `)
        .order('data_agendamento', { ascending: true });

      if (agendamentosError) throw agendamentosError;
      setAgendamentos(agendamentosData || []);

      // Carregar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from('clients')
        .select('id, nome, telefone')
        .eq('is_active', true);

      if (clientesError) throw clientesError;
      setClientes(clientesData || []);

      // Carregar serviços
      const { data: servicosData, error: servicosError } = await supabase
        .from('services')
        .select('id, nome')
        .eq('is_active', true);

      if (servicosError) throw servicosError;
      setServicos(servicosData || []);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Group schedules by date for tabs
  const todaySchedules = agendamentos.filter(agendamento => isToday(new Date(agendamento.data_agendamento)));
  const tomorrowSchedules = agendamentos.filter(agendamento => isTomorrow(new Date(agendamento.data_agendamento)));
  const upcomingSchedules = agendamentos.filter(agendamento => {
    const scheduleDate = new Date(agendamento.data_agendamento);
    return scheduleDate > addDays(new Date(), 1);
  });
  
  const handleNewSchedule = () => {
    navigate('/dashboard/agendamentos/novo');
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
  };

  // Filtrar agendamentos por termo de busca
  const agendamentosFiltrados = agendamentos.filter(agendamento =>
    agendamento.clients?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agendamento.services?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agendamento.observacoes?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Agendamentos</h1>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar agendamento..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleNewSchedule}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Agendamento
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendario" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="calendario">
            <Calendar className="h-4 w-4 mr-2" />
            Calendário Interativo
          </TabsTrigger>
          <TabsTrigger value="hoje">
            Hoje ({todaySchedules.length})
          </TabsTrigger>
          <TabsTrigger value="amanha">
            Amanhã ({tomorrowSchedules.length})
          </TabsTrigger>
          <TabsTrigger value="proximos">
            Próximos ({upcomingSchedules.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendario">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <CalendarioInterativo agendamentos={agendamentosFiltrados} />
          )}
        </TabsContent>

        <TabsContent value="hoje">
          <div className="bg-white rounded-md p-4">
            <h2 className="text-xl font-semibold mb-4">Agendamentos de Hoje</h2>
            
            {todaySchedules.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Sem agendamentos hoje</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Não há agendamentos para hoje
                </p>
                <Button 
                  onClick={handleNewSchedule} 
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agendar Serviço
                </Button>
              </div>
            ) : (
              <div>
                {todaySchedules.map(renderScheduleCard)}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="tomorrow">
          <div className="bg-white rounded-md p-4">
            <h2 className="text-xl font-semibold mb-4">Agendamentos de Amanhã</h2>
            
            {tomorrowSchedules.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Sem agendamentos amanhã</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Não há agendamentos para amanhã
                </p>
                <Button 
                  onClick={handleNewSchedule} 
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agendar Serviço
                </Button>
              </div>
            ) : (
              <div>
                {tomorrowSchedules.map(renderScheduleCard)}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <div className="bg-white rounded-md p-4">
            <h2 className="text-xl font-semibold mb-4">Próximos Agendamentos</h2>
            
            {upcomingSchedules.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Sem agendamentos futuros</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Não há agendamentos para os próximos dias
                </p>
                <Button 
                  onClick={handleNewSchedule} 
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agendar Serviço
                </Button>
              </div>
            ) : (
              <div>
                {upcomingSchedules.map(renderScheduleCard)}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchedulesPage;

import { ArrowRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Render schedule card
const renderScheduleCard = (agendamento: any) => (
  <Card key={agendamento.id} className="mb-4 hover:shadow-md transition-shadow">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg">{agendamento.services?.nome || agendamento.descricao_servico}</CardTitle>
          <CardDescription>{agendamento.clients?.nome}</CardDescription>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {agendamento.horario}
          </Badge>
          <Badge 
            variant={agendamento.status === 'agendado' ? 'default' : 
                   agendamento.status === 'concluido' ? 'default' : 'destructive'}
            className={
              agendamento.status === 'agendado' ? 'bg-yellow-100 text-yellow-800' :
              agendamento.status === 'concluido' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }
          >
            {agendamento.status}
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pb-2">
      <p className="text-sm text-gray-600 mb-1">
        <strong>Cliente:</strong> {agendamento.clients?.nome}
      </p>
      <p className="text-sm text-gray-600 mb-1">
        <strong>Telefone:</strong> {agendamento.clients?.telefone}
      </p>
      {agendamento.observacoes && (
        <p className="text-sm text-gray-600">
          <strong>Observações:</strong> {agendamento.observacoes}
        </p>
      )}
    </CardContent>
    <CardFooter className="pt-0 flex justify-between">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/agendamentos/${agendamento.id}`)}>
        Ver detalhes
        <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </CardFooter>
  </Card>
);
