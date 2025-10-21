import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    telefone: '',
    logo_url: ''
  });
  
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setProfile({
          name: data.full_name || '',
          email: user?.email || '',
          telefone: data.telefone || '',
          logo_url: data.logo_url || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do perfil',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const updates = {
        id: user?.id,
        full_name: profile.name,
        telefone: profile.telefone,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);
        
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o perfil',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.new !== password.confirm) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: password.new
      });
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Senha atualizada com sucesso',
      });
      
      setPassword({
        current: '',
        new: '',
        confirm: ''
      });
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a senha',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Configurações e Perfil</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e de contato.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.logo_url || ''} />
                    <AvatarFallback>{profile.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" type="button">
                    Alterar foto
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input 
                      id="name" 
                      value={profile.name} 
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profile.email} 
                      disabled
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input 
                      id="telefone" 
                      value={profile.telefone} 
                      onChange={(e) => setProfile({...profile, telefone: e.target.value})}
                    />
                  </div>
                </div>
                
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar alterações
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Gerencie sua senha e configurações de segurança.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Senha atual</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      value={password.current}
                      onChange={(e) => setPassword({...password, current: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">Nova senha</Label>
                    <Input 
                      id="new-password" 
                      type="password"
                      value={password.new}
                      onChange={(e) => setPassword({...password, new: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      value={password.confirm}
                      onChange={(e) => setPassword({...password, confirm: e.target.value})}
                    />
                  </div>
                </div>
                
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Atualizar senha
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Configure como deseja receber notificações.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Configurações de notificação serão implementadas em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;