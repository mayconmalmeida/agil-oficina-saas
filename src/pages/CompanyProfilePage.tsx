
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import Loading from '@/components/ui/loading';
import CompanyProfileForm from '@/components/company/CompanyProfileForm';
import CompanyLogoUpload from '@/components/company/CompanyLogoUpload';
import CompanyDocuments from '@/components/company/CompanyDocuments';

const CompanyProfilePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            variant: "destructive",
            title: "Acesso não autorizado",
            description: "Faça login para acessar esta página.",
          });
          navigate('/login');
          return;
        }
        
        // Fetch company profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        setProfileData(data);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: error.message || "Não foi possível carregar os dados da empresa",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [navigate, toast]);

  const handleProfileSaved = () => {
    toast({
      title: "Dados atualizados",
      description: "As informações da empresa foram salvas com sucesso.",
    });
  };

  if (isLoading) {
    return <Loading fullscreen text="Carregando dados da empresa..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Perfil da Empresa</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Informações Básicas</TabsTrigger>
            <TabsTrigger value="logo">Logo e Imagem</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>
          
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'profile' && 'Dados da Empresa'}
                {activeTab === 'logo' && 'Logo e Identidade Visual'}
                {activeTab === 'documents' && 'Documentos e Certificações'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'profile' && 'Edite as informações de contato e endereço da sua empresa'}
                {activeTab === 'logo' && 'Gerencie a identidade visual da sua oficina'}
                {activeTab === 'documents' && 'Adicione documentos importantes como certificações e licenças'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="profile">
                <CompanyProfileForm 
                  initialData={profileData} 
                  onSave={handleProfileSaved}
                />
              </TabsContent>
              
              <TabsContent value="logo">
                <CompanyLogoUpload 
                  initialLogo={profileData?.logo_url} 
                  userId={profileData?.id}
                  onSave={handleProfileSaved}
                />
              </TabsContent>
              
              <TabsContent value="documents">
                <CompanyDocuments 
                  documents={profileData?.documents || []}
                  userId={profileData?.id}
                  onSave={handleProfileSaved}
                />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default CompanyProfilePage;
