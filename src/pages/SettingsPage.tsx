
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import Loading from '@/components/ui/loading';
import SupportSettings from '@/components/settings/SupportSettings';

const SettingsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [profileData, setProfileData] = useState<any>({});
  const { toast } = useToast();
  
  // Fetch user and profile data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            variant: "destructive",
            title: "Não autenticado",
            description: "Você precisa estar logado para acessar esta página.",
          });
          return;
        }
        
        setUserId(user.id);
        
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível carregar os dados do perfil.",
          });
          return;
        }
        
        setProfileData(profileData || {});
        
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  if (isLoading) {
    return <Loading text="Carregando configurações..." />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      
      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="suporte">Suporte</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral" className="space-y-4">
          <p className="text-muted-foreground">
            Configurações gerais do sistema serão adicionadas aqui.
          </p>
        </TabsContent>
        
        <TabsContent value="suporte" className="space-y-4">
          <SupportSettings 
            userId={userId} 
            initialValues={{
              whatsapp_suporte: profileData?.whatsapp_suporte || '46991270777'
            }} 
          />
        </TabsContent>
        
        <TabsContent value="notificacoes" className="space-y-4">
          <p className="text-muted-foreground">
            Configurações de notificações serão adicionadas aqui.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
