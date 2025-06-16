
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
import { Building, Upload, FileText, Settings } from 'lucide-react';

const CompanyPage: React.FC = () => {
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
        console.error('Erro ao carregar dados da empresa:', error);
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
    
    // Recarregar os dados
    const refetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfileData(data);
      }
    };
    refetchData();
  };

  if (isLoading) {
    return <Loading fullscreen text="Carregando dados da empresa..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center space-x-2 mb-6">
          <Building className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dados da Empresa
          </h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 grid grid-cols-3 gap-1">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Informações</span>
            </TabsTrigger>
            <TabsTrigger value="logo" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Logo</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Documentos</span>
            </TabsTrigger>
          </TabsList>
          
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>
                {activeTab === 'profile' && 'Informações da Empresa'}
                {activeTab === 'logo' && 'Logo e Identidade Visual'}
                {activeTab === 'documents' && 'Documentos e Certificações'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'profile' && 'Configure as informações básicas, contato e endereço da sua oficina'}
                {activeTab === 'logo' && 'Faça upload do logo da sua empresa para personalizar orçamentos e documentos'}
                {activeTab === 'documents' && 'Gerencie documentos importantes como certificações, licenças e contratos'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6">
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

export default CompanyPage;
