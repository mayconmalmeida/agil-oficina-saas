
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, Car, Wrench } from 'lucide-react';

const NewAppointmentPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Novo Agendamento</h1>
          <p className="text-gray-600 mt-2">Agende um novo serviço para seu cliente</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <User className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-medium ml-2">1. Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Selecione ou cadastre um cliente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Car className="h-4 w-4 text-green-600" />
              <CardTitle className="text-sm font-medium ml-2">2. Veículo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Escolha o veículo do cliente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Wrench className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-sm font-medium ml-2">3. Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Defina os serviços a serem realizados
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Formulário de Agendamento
            </CardTitle>
            <CardDescription>
              Esta funcionalidade está em desenvolvimento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Funcionalidade em Desenvolvimento
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                O sistema de agendamentos está sendo desenvolvido. Em breve você poderá:
              </p>
              <ul className="mt-4 text-sm text-gray-600 space-y-1">
                <li>• Agendar serviços para clientes</li>
                <li>• Definir horários disponíveis</li>
                <li>• Gerenciar agenda da oficina</li>
                <li>• Enviar notificações automáticas</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewAppointmentPage;
