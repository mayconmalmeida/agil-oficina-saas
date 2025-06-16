
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { formatCNPJ, formatCEP } from '@/utils/formatUtils';

interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  cnpj: string;
  address: string;
  cep: string;
  city: string;
  state: string;
  created_at: string;
}

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    phone: '',
    email: '',
    cnpj: '',
    address: '',
    cep: '',
    city: '',
    state: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error: any) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newSupplier.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!newSupplier.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!newSupplier.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(newSupplier.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!newSupplier.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    }

    if (!newSupplier.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    if (!newSupplier.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    }

    if (!newSupplier.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }

    if (!newSupplier.state.trim()) {
      newErrors.state = 'Estado é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addSupplier = async () => {
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('suppliers')
        .insert({
          name: newSupplier.name.trim(),
          phone: newSupplier.phone.trim(),
          email: newSupplier.email.trim(),
          cnpj: newSupplier.cnpj.trim(),
          address: newSupplier.address.trim(),
          cep: newSupplier.cep.trim(),
          city: newSupplier.city.trim(),
          state: newSupplier.state.trim(),
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Fornecedor adicionado",
        description: `${newSupplier.name} foi adicionado com sucesso.`,
      });

      setNewSupplier({
        name: '',
        phone: '',
        email: '',
        cnpj: '',
        address: '',
        cep: '',
        city: '',
        state: ''
      });
      setErrors({});
      fetchSuppliers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar fornecedor",
        description: error.message,
      });
    }
  };

  const deleteSupplier = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Fornecedor removido",
        description: `${name} foi removido com sucesso.`,
      });

      fetchSuppliers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover fornecedor",
        description: error.message,
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'cnpj') {
      formattedValue = formatCNPJ(value);
    } else if (field === 'cep') {
      formattedValue = formatCEP(value);
    }
    
    setNewSupplier(prev => ({
      ...prev,
      [field]: formattedValue
    }));
    
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Adicionar Novo Fornecedor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                placeholder="Nome do fornecedor *"
                value={newSupplier.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <Input
                placeholder="Telefone *"
                value={newSupplier.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            
            <div>
              <Input
                placeholder="Email *"
                type="email"
                value={newSupplier.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <Input
                placeholder="CNPJ *"
                value={newSupplier.cnpj}
                onChange={(e) => handleInputChange('cnpj', e.target.value)}
                className={errors.cnpj ? 'border-red-500' : ''}
                maxLength={18}
              />
              {errors.cnpj && <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>}
            </div>
            
            <div>
              <Input
                placeholder="Endereço *"
                value={newSupplier.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
            
            <div>
              <Input
                placeholder="CEP *"
                value={newSupplier.cep}
                onChange={(e) => handleInputChange('cep', e.target.value)}
                className={errors.cep ? 'border-red-500' : ''}
                maxLength={9}
              />
              {errors.cep && <p className="text-red-500 text-sm mt-1">{errors.cep}</p>}
            </div>
            
            <div>
              <Input
                placeholder="Cidade *"
                value={newSupplier.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>
            
            <div>
              <Input
                placeholder="Estado *"
                value={newSupplier.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className={errors.state ? 'border-red-500' : ''}
                maxLength={2}
              />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
            </div>
          </div>
          
          <div className="mt-4">
            <Button onClick={addSupplier} className="bg-oficina hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Fornecedor
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Fornecedores ({suppliers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum fornecedor cadastrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.cnpj}</TableCell>
                    <TableCell>{supplier.city}/{supplier.state}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteSupplier(supplier.id, supplier.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuppliersPage;
