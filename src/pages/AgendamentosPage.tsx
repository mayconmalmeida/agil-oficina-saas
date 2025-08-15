
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Clock, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScheduleForm from '@/components/schedule/ScheduleForm';

const AgendamentosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('lista');
  const [agendamentos] = useState([
    {
      id: 1,
      cliente: 'João Silva',
      servico: 'Revisão Completa',
      data: '2024-01-15',
      hora: '14:00',
      status: 'Agendado'
    },
    {
      id: 2,
      cliente: 'Maria Santos',
      servico: 'Troca de Óleo',
      data: '2024-01-16',
      hora: '09:00',
      status: 'Confirmado'
    }
  ]);

  const handleNewSchedule = () => {
    setActiveTab('novo');
  };

  const handleScheduleCreated = () => {
    setActiveTab('lista');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
        <Button onClick={handleNewSchedule}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="lista">Lista de Agendamentos</TabsTrigger>
          <TabsTrigger value="novo">Novo Agendamento</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          <div className="grid gap-4">
            {agendamentos.map((agendamento) => (
              <Card key={agendamento.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{agendamento.cliente}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{new Date(agendamento.data).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{agendamento.hora}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{agendamento.servico}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {agendamento.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="novo">
          <Card>
            <CardHeader>
              <CardTitle>Novo Agendamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ScheduleForm onSuccess={handleScheduleCreated} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgendamentosPage;
