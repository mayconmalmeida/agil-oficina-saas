
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useOficinaFilters } from '@/hooks/useOficinaFilters';

interface Supplier {
  id: string;
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  created_at: string;
}

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { oficina_id, isReady } = useOficinaFilters();

  useEffect(() => {
    if (isReady) {
      loadSuppliers();
    }
  }, [isReady, oficina_id]);

  useEffect(() => {
    const filtered = suppliers.filter(supplier =>
      supplier.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.cnpj?.includes(searchTerm) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSuppliers(filtered);
  }, [searchTerm, suppliers]);

  const loadSuppliers = async () => {
    if (!oficina_id) {
      console.log('⚠️ Oficina ID não encontrado');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Carregando fornecedores para oficina:', oficina_id);

      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .eq('oficina_id', oficina_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar fornecedores:', error);
        throw error;
      }

      console.log('✅ Fornecedores carregados:', data?.length || 0);
      setSuppliers(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar fornecedores",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCNPJ = (cnpj?: string) => {
    if (!cnpj) return 'N/A';
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (!oficina_id) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Oficina não encontrada. Entre em contato com o suporte.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando fornecedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <Badge variant="outline">
          {suppliers.length} fornecedores cadastrados
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Buscar por nome, CNPJ ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSuppliers.map((supplier) => (
                <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{supplier.nome}</h3>
                        <p className="text-sm text-gray-600">
                          CNPJ: {formatCNPJ(supplier.cnpj)}
                        </p>
                      </div>

                      {supplier.email && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{supplier.email}</span>
                        </div>
                      )}

                      {supplier.telefone && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{supplier.telefone}</span>
                        </div>
                      )}

                      {(supplier.endereco || supplier.cidade) && (
                        <div className="flex items-start space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            {supplier.endereco && <p>{supplier.endereco}</p>}
                            {supplier.cidade && (
                              <p>{supplier.cidade}{supplier.estado && ` - ${supplier.estado}`}</p>
                            )}
                            {supplier.cep && <p>CEP: {supplier.cep}</p>}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500">
                          Cadastrado em: {new Date(supplier.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuppliersPage;
