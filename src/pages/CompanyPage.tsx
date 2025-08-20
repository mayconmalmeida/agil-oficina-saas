
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Building, Save, Upload } from 'lucide-react';

const CompanyPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [companyData, setCompanyData] = useState({
    nome_oficina: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    responsavel: '',
    logo_url: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar dados da empresa:', error);
        return;
      }

      if (data) {
        setCompanyData({
          nome_oficina: data.nome_oficina || '',
          cnpj: data.cnpj || '',
          telefone: data.telefone || '',
          email: data.email || '',
          endereco: data.endereco || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
          cep: data.cep || '',
          responsavel: data.responsavel || '',
          logo_url: data.logo_url || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Usuário não autenticado"
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update(companyData)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Dados da empresa salvos com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar os dados da empresa"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Building className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Dados da Empresa</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome_oficina">Nome da Oficina *</Label>
              <Input
                id="nome_oficina"
                value={companyData.nome_oficina}
                onChange={(e) => handleInputChange('nome_oficina', e.target.value)}
                placeholder="Digite o nome da oficina"
              />
            </div>

            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={companyData.cnpj}
                onChange={(e) => handleInputChange('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                value={companyData.responsavel}
                onChange={(e) => handleInputChange('responsavel', e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={companyData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={companyData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contato@oficina.com"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={companyData.cep}
                onChange={(e) => handleInputChange('cep', e.target.value)}
                placeholder="00000-000"
              />
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={companyData.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
                placeholder="Rua, número"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={companyData.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  placeholder="Cidade"
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={companyData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="logo_url">URL do Logo</Label>
              <Input
                id="logo_url"
                value={companyData.logo_url}
                onChange={(e) => handleInputChange('logo_url', e.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
            </div>

            {companyData.logo_url && (
              <div className="mt-4">
                <Label>Preview do Logo</Label>
                <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                  <img 
                    src={companyData.logo_url} 
                    alt="Logo da empresa" 
                    className="max-h-32 max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Salvando...' : 'Salvar Dados'}
        </Button>
      </div>
    </div>
  );
};

export default CompanyPage;
