
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Server, Clock, HardDrive, Wifi } from 'lucide-react';

const BackupConfiguration: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-blue-600" />
            <span>Configuração do Servidor de Backup</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="server-ip">Endereço IP do Servidor</Label>
              <Input 
                id="server-ip" 
                placeholder="192.168.1.100" 
                type="text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="server-port">Porta</Label>
              <Input 
                id="server-port" 
                placeholder="22" 
                type="number"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input 
                id="username" 
                placeholder="backup_user" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backup-path">Caminho do Backup no Servidor</Label>
            <Input 
              id="backup-path" 
              placeholder="/backups/oficina/" 
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Backup Automático</Label>
                <p className="text-sm text-gray-600">Ativar backup automático diário</p>
              </div>
              <Switch />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Horário do Backup</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01:00">01:00</SelectItem>
                    <SelectItem value="02:00">02:00</SelectItem>
                    <SelectItem value="03:00">03:00</SelectItem>
                    <SelectItem value="04:00">04:00</SelectItem>
                    <SelectItem value="05:00">05:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Retenção (dias)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Quantos dias manter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button className="flex items-center space-x-2">
              <Wifi className="h-4 w-4" />
              <span>Testar Conexão</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4" />
              <span>Fazer Backup Agora</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupConfiguration;
