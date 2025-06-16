
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Plus, ArrowRight, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data
const mockSchedules = [
  {
    id: '1',
    data: '2023-05-20T10:00:00',
    horario: '10:00',
    cliente: 'João Silva',
    veiculo: 'Ford Focus - ABC-1234',
    servico: 'Troca de óleo',
    status: 'agendado'
  },
  {
    id: '2',
    data: '2023-05-20T14:30:00',
    horario: '14:30',
    cliente: 'Maria Oliveira',
    veiculo: 'Honda Civic - DEF-5678',
    servico: 'Revisão completa',
    status: 'agendado'
  },
  {
    id: '3',
    data: new Date().toISOString(),
    horario: '15:00',
    cliente: 'Paulo Santos',
    veiculo: 'Fiat Uno - GHI-9012',
    servico: 'Alinhamento e balanceamento',
    status: 'agendado'
  },
  {
    id: '4',
    data: addDays(new Date(), 1).toISOString(),
    horario: '09:30',
    cliente: 'Ana Ferreira',
    veiculo: 'VW Gol - JKL-3456',
    servico: 'Troca de pastilhas de freio',
    status: 'agendado'
  },
  {
    id: '5',
    data: addDays(new Date(), 2).toISOString(),
    horario: '11:00',
    cliente: 'Ricardo Gomes',
    veiculo: 'Toyota Corolla - MNO-7890',
    servico: 'Troca de correia dentada',
    status: 'agendado'
  }
];

const SchedulesPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Filter schedules by date
  const schedulesByDate = date 
    ? mockSchedules.filter(schedule => {
        const scheduleDate = parseISO(schedule.data);
        return scheduleDate.toDateString() === date.toDateString();
      })
    : [];
    
  // Filter schedules by search term
  const filteredSchedules = schedulesByDate.filter(schedule => 
    schedule.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.veiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.servico.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group schedules by date for tabs
  const todaySchedules = mockSchedules.filter(schedule => isToday(parseISO(schedule.data)));
  const tomorrowSchedules = mockSchedules.filter(schedule => isTomorrow(parseISO(schedule.data)));
  const upcomingSchedules = mockSchedules.filter(schedule => {
    const scheduleDate = parseISO(schedule.data);
    return scheduleDate > addDays(new Date(), 1);
  });
  
  // Format date for display
  const formatDateHeader = (date?: Date) => {
    if (!date) return 'Selecione uma data';
    
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };
  
  // Render schedule card
  const renderScheduleCard = (schedule: typeof mockSchedules[0]) => (
    <Card key={schedule.id} className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{schedule.servico}</CardTitle>
            <CardDescription>{schedule.cliente}</CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {schedule.horario}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-600">{schedule.veiculo}</p>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/agendamentos/${schedule.id}`)}>
          Ver detalhes
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  const handleNewSchedule = () => {
    navigate('/dashboard/agendamentos/novo');
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
  };
  
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calendário</CardTitle>
              <CardDescription>Selecione uma data para ver os agendamentos</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="date" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="date">
                <Calendar className="h-4 w-4 mr-2" />
                Por Data
              </TabsTrigger>
              <TabsTrigger value="today">
                Hoje ({todaySchedules.length})
              </TabsTrigger>
              <TabsTrigger value="tomorrow">
                Amanhã ({tomorrowSchedules.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Próximos ({upcomingSchedules.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="date">
              <div className="bg-white rounded-md p-4">
                <h2 className="text-xl font-semibold mb-4">{formatDateHeader(date)}</h2>
                
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ))}
                  </div>
                ) : filteredSchedules.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Nenhum agendamento</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm 
                        ? 'Tente ajustar sua busca' 
                        : 'Não há agendamentos para esta data'}
                    </p>
                    {!searchTerm && (
                      <Button 
                        onClick={handleNewSchedule} 
                        className="mt-4"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Agendar Serviço
                      </Button>
                    )}
                  </div>
                ) : (
                  <div>
                    {filteredSchedules.map(renderScheduleCard)}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="today">
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
      </div>
    </div>
  );
};

export default SchedulesPage;
