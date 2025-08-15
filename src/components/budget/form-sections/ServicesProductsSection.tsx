import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  nome: string;
  tipo: 'servico' | 'produto';
  valor: number;
  descricao?: string;
}

interface SelectedItem {
  id: string;
  nome: string;
  tipo: 'servico' | 'produto';
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

interface ServicesProductsSectionProps {
  selectedItems: SelectedItem[];
  onItemsChange: (items: SelectedItem[]) => void;
}

const ServicesProductsSection: React.FC<ServicesProductsSectionProps> = ({
  selectedItems,
  onItemsChange
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadServicesAndProducts();
  }, []);

  const loadServicesAndProducts = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('nome');

      if (error) throw error;

      // Type cast the data properly
      const typedData = (data || []).map(item => ({
        ...item,
        tipo: item.tipo as 'servico' | 'produto'
      }));

      const servicesData = typedData.filter(item => item.tipo === 'servico');
      const productsData = typedData.filter(item => item.tipo === 'produto');

      setServices(servicesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Erro ao carregar serviços e produtos:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os serviços e produtos."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addService = () => {
    const service = services.find(s => s.id === selectedServiceId);
    if (!service) return;

    const newItem: SelectedItem = {
      id: service.id,
      nome: service.nome,
      tipo: 'servico',
      quantidade: 1,
      valor_unitario: service.valor,
      valor_total: service.valor
    };

    onItemsChange([...selectedItems, newItem]);
    setSelectedServiceId('');
  };

  const addProduct = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const newItem: SelectedItem = {
      id: product.id,
      nome: product.nome,
      tipo: 'produto',
      quantidade: 1,
      valor_unitario: product.valor,
      valor_total: product.valor
    };

    onItemsChange([...selectedItems, newItem]);
    setSelectedProductId('');
  };

  const updateItemQuantity = (index: number, quantidade: number) => {
    const updatedItems = [...selectedItems];
    updatedItems[index].quantidade = quantidade;
    updatedItems[index].valor_total = quantidade * updatedItems[index].valor_unitario;
    onItemsChange(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = selectedItems.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalGeral = selectedItems.reduce((sum, item) => sum + item.valor_total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Serviços e Produtos</CardTitle>
        <CardDescription>
          Selecione os serviços e produtos para este orçamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Adicionar Serviços */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Adicionar Serviço</Label>
            <div className="flex gap-2">
              <Select 
                value={selectedServiceId} 
                onValueChange={setSelectedServiceId}
                disabled={isLoading}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{service.nome}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {formatCurrency(service.valor)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                onClick={addService}
                disabled={!selectedServiceId}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Adicionar Produto</Label>
            <div className="flex gap-2">
              <Select 
                value={selectedProductId} 
                onValueChange={setSelectedProductId}
                disabled={isLoading}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{product.nome}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {formatCurrency(product.valor)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                onClick={addProduct}
                disabled={!selectedProductId}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Itens Selecionados */}
        {selectedItems.length > 0 && (
          <div className="space-y-4">
            <div className="border rounded-lg">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h4 className="font-medium">Itens Selecionados</h4>
              </div>
              <div className="divide-y">
                {selectedItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{item.nome}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.tipo === 'servico' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {item.tipo === 'servico' ? 'Serviço' : 'Produto'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Label>Qtd:</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </div>
                        <span>Unitário: {formatCurrency(item.valor_unitario)}</span>
                        <span className="font-medium">Total: {formatCurrency(item.valor_total)}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 px-4 py-3 border-t">
                <div className="flex justify-between items-center font-medium">
                  <span>Total Geral:</span>
                  <span className="text-lg">{formatCurrency(totalGeral)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServicesProductsSection;
