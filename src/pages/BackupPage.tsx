
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Download, Upload, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BackupPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-teal-600" />
        <h1 className="text-2xl font-bold text-gray-900">Backup Automático</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Status do Backup</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Último backup:</span>
              <span className="font-medium">Hoje, 03:00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Próximo backup:</span>
              <span className="font-medium">Amanhã, 03:00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Frequência:</span>
              <span className="font-medium">Diário</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="text-green-600 font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Ativo
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Histórico de Backups</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">16/06/2025 - 03:00</span>
              <span className="text-green-600 text-sm">Sucesso</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">15/06/2025 - 03:00</span>
              <span className="text-green-600 text-sm">Sucesso</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">14/06/2025 - 03:00</span>
              <span className="text-green-600 text-sm">Sucesso</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">13/06/2025 - 03:00</span>
              <span className="text-green-600 text-sm">Sucesso</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ações de Backup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Fazer Backup Agora</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Baixar Backup</span>
            </Button>
          </div>
          <Button variant="outline" className="w-full flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Restaurar do Backup</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupPage;
