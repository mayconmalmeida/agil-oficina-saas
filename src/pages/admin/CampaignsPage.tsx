
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Mail, MessageSquare, Bell } from 'lucide-react';

const CampaignsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gerenciar Campanhas
            </h1>
            <p className="text-gray-600 mt-2">
              Crie e gerencie campanhas de marketing e comunicação com usuários.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Campanha
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Criar nova campanha */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Criar Nova Campanha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome da Campanha</label>
                <Input placeholder="Ex: Promoção de Primavera 2024" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Campanha</label>
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                    <Mail className="h-6 w-6 mb-2" />
                    Email
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                    <MessageSquare className="h-6 w-6 mb-2" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                    <Bell className="h-6 w-6 mb-2" />
                    Notificação
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Assunto</label>
                <Input placeholder="Assunto da campanha" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mensagem</label>
                <Textarea 
                  placeholder="Digite o conteúdo da sua campanha..."
                  rows={6}
                />
              </div>

              <div className="flex gap-3">
                <Button>Criar Campanha</Button>
                <Button variant="outline">Salvar como Rascunho</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campanhas recentes */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">Campanha {index}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        index % 2 === 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {index % 2 === 0 ? 'Enviada' : 'Rascunho'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {index % 2 === 0 ? 'Enviada há 2 dias' : 'Criada há 1 dia'}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Enviadas</span>
                  <span className="text-sm font-medium">23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taxa de Abertura</span>
                  <span className="text-sm font-medium">68%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taxa de Clique</span>
                  <span className="text-sm font-medium">24%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Conversões</span>
                  <span className="text-sm font-medium">12</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CampaignsPage;
