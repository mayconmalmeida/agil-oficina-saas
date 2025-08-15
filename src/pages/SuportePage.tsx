
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Headphones, MessageSquare, Phone, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SupportSettings from '@/components/settings/support/SupportSettings';
import { useAuth } from '@/contexts/AuthContext';

const SuportePage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Headphones className="h-6 w-6 text-pink-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Suporte</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Canais de Suporte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Chat Ao Vivo</span>
            </Button>
            <Button variant="outline" className="w-full flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Telefone: (46) 99127-0777</span>
            </Button>
            <Button variant="outline" className="w-full flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp Business</span>
            </Button>
          </CardContent>
        </Card>

        {/* Configurações de Suporte - apenas para administradores */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Suporte</CardTitle>
            </CardHeader>
            <CardContent>
              <SupportSettings />
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Como funciona o Suporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg dark:border-gray-700">
              <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">1. Contato Rápido</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use nossos canais de suporte para tirar dúvidas rapidamente
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg dark:border-gray-700">
              <Phone className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">2. Atendimento Direto</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Entre em contato via telefone ou WhatsApp para suporte personalizado
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg dark:border-gray-700">
              <CheckCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">3. Resolução Rápida</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nossa equipe especializada resolve suas dúvidas rapidamente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuportePage;
