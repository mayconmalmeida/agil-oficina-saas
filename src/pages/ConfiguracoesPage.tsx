
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Save, User, Bell, Shield, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { validateOficinaUniqueness } from '@/utils/oficinasValidation';

const ConfiguracoesPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    nome_oficina: '',
    email: '',
    telefone: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    responsavel: '',
    whatsapp_suporte: ''
  });
  const [notifications, setNotifications] = useState({
    email_agendamentos: true,
    sms_lembretes: false,
    notificacoes_push: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile({
          nome_oficina: profileData.nome_oficina || '',
          email: profileData.email || '',
          telefone: profileData.telefone || '',
          cnpj: profileData.cnpj || '',
          endereco: profileData.endereco || '',
          cidade: profileData.cidade || '',
          estado: profileData.estado || '',
          cep: profileData.cep || '',
          responsavel: profileData.responsavel || '',
          whatsapp_suporte: profileData.whatsapp_suporte || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Validar email e CNPJ únicos
      const validation = await validateOficinaUniqueness(
        profile.email,
        profile.cnpj,
        user.id
      );

      if (!validation.valid) {
        toast({
          variant: "destructive",
          title: "Erro de validação",
          description: validation.message,
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    toast({
      title: "Notificações atualizadas",
      description: "Suas preferências de notificação foram salvas.",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-600" />
          Configurações
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as configurações da sua oficina e preferências
        </p>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="aparencia" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Oficina</CardTitle>
              <CardDescription>
                Atualize os dados da sua oficina
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_oficina">Nome da Oficina</Label>
                  <Input
                    id="nome_oficina"
                    value={profile.nome_oficina}
                    onChange={(e) => setProfile(prev => ({ ...prev, nome_oficina: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    value={profile.responsavel}
                    onChange={(e) => setProfile(prev => ({ ...prev, responsavel: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={profile.telefone}
                    onChange={(e) => setProfile(prev => ({ ...prev, telefone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={profile.cnpj}
                    onChange={(e) => setProfile(prev => ({ ...prev, cnpj: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_suporte">WhatsApp Suporte</Label>
                  <Input
                    id="whatsapp_suporte"
                    value={profile.whatsapp_suporte}
                    onChange={(e) => setProfile(prev => ({ ...prev, whatsapp_suporte: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={profile.endereco}
                  onChange={(e) => setProfile(prev => ({ ...prev, endereco: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={profile.cidade}
                    onChange={(e) => setProfile(prev => ({ ...prev, cidade: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={profile.estado}
                    onChange={(e) => setProfile(prev => ({ ...prev, estado: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={profile.cep}
                    onChange={(e) => setProfile(prev => ({ ...prev, cep: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={loading} className="w-full md:w-auto">
                {loading ? 'Salvando...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Configure como você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber emails sobre novos agendamentos
                  </p>
                </div>
                <Switch
                  checked={notifications.email_agendamentos}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, email_agendamentos: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Lembretes por SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber SMS de lembrete para agendamentos
                  </p>
                </div>
                <Switch
                  checked={notifications.sms_lembretes}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, sms_lembretes: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações no navegador
                  </p>
                </div>
                <Switch
                  checked={notifications.notificacoes_push}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, notificacoes_push: checked }))
                  }
                />
              </div>

              <Button onClick={handleSaveNotifications} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Salvar Preferências
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
              <CardDescription>
                Gerencie a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Alterar Senha</Label>
                <Button variant="outline" className="w-full md:w-auto">
                  Alterar Senha
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Autenticação de Dois Fatores</Label>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança à sua conta
                </p>
                <Button variant="outline" className="w-full md:w-auto">
                  Configurar 2FA
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Aparência</CardTitle>
              <CardDescription>
                Personalize a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Claro</Button>
                  <Button variant="outline" size="sm">Escuro</Button>
                  <Button variant="outline" size="sm">Automático</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tamanho da Fonte</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Pequeno</Button>
                  <Button variant="outline" size="sm">Médio</Button>
                  <Button variant="outline" size="sm">Grande</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracoesPage;
