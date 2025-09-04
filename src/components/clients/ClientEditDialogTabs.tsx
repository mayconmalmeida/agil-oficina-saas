import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit2, Trash2, Car, User } from 'lucide-react';
import { useClientVehicles } from '@/hooks/useClientVehicles';

interface Client {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  veiculo: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  placa?: string;
  cor?: string;
  tipo?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  documento?: string;
  kilometragem?: string;
  bairro?: string;
  numero?: string;
}

interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  cor?: string;
  kilometragem?: string;
  tipo_combustivel?: string;
}

interface ClientEditDialogTabsProps {
  clientId: string;
  onClose: () => void;
  onSave: () => void;
}

const ClientEditDialogTabs: React.FC<ClientEditDialogTabsProps> = ({ clientId, onClose, onSave }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({});
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const { toast } = useToast();
  const { vehicles, isLoading: vehiclesLoading, refetch: refetchVehicles } = useClientVehicles(clientId);

  useEffect(() => {
    loadClient();
  }, [clientId]);

  const loadClient = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      setClient(data);
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados do cliente."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClient = async () => {
    if (!client) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          nome: client.nome,
          telefone: client.telefone,
          email: client.email,
          tipo: client.tipo,
          endereco: client.endereco,
          cidade: client.cidade,
          estado: client.estado,
          cep: client.cep,
          documento: client.documento,
          bairro: client.bairro,
          numero: client.numero
        })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Cliente atualizado",
        description: "Dados pessoais salvos com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as alterações."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.marca || !newVehicle.modelo || !newVehicle.ano || !newVehicle.placa) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha marca, modelo, ano e placa do veículo."
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('veiculos')
        .insert({
          cliente_id: clientId,
          user_id: user.id,
          marca: newVehicle.marca,
          modelo: newVehicle.modelo,
          ano: newVehicle.ano,
          placa: newVehicle.placa,
          cor: newVehicle.cor,
          kilometragem: newVehicle.kilometragem,
          tipo_combustivel: newVehicle.tipo_combustivel
        });

      if (error) throw error;

      setNewVehicle({});
      setIsAddingVehicle(false);
      refetchVehicles();
      toast({
        title: "Veículo adicionado",
        description: "Novo veículo cadastrado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o veículo."
      });
    }
  };

  const handleUpdateVehicle = async () => {
    if (!editingVehicle) return;

    try {
      const { error } = await supabase
        .from('veiculos')
        .update({
          marca: editingVehicle.marca,
          modelo: editingVehicle.modelo,
          ano: editingVehicle.ano,
          placa: editingVehicle.placa,
          cor: editingVehicle.cor,
          kilometragem: editingVehicle.kilometragem,
          tipo_combustivel: editingVehicle.tipo_combustivel
        })
        .eq('id', editingVehicle.id);

      if (error) throw error;

      setEditingVehicle(null);
      refetchVehicles();
      toast({
        title: "Veículo atualizado",
        description: "Dados do veículo salvos com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as alterações."
      });
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) return;

    try {
      const { error } = await supabase
        .from('veiculos')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;

      refetchVehicles();
      toast({
        title: "Veículo excluído",
        description: "Veículo removido com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o veículo."
      });
    }
  };

  const updateClientField = (field: keyof Client, value: string) => {
    if (client) {
      setClient({ ...client, [field]: value });
    }
  };

  const updateVehicleField = (field: keyof Vehicle, value: string) => {
    if (editingVehicle) {
      setEditingVehicle({ ...editingVehicle, [field]: value });
    }
  };

  const updateNewVehicleField = (field: keyof Vehicle, value: string) => {
    setNewVehicle({ ...newVehicle, [field]: value });
  };

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!client) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente: {client.nome}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Dados Pessoais
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Veículos ({vehicles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={client.nome}
                    onChange={(e) => updateClientField('nome', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={client.telefone}
                    onChange={(e) => updateClientField('telefone', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={client.email || ''}
                    onChange={(e) => updateClientField('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={client.tipo} onValueChange={(value) => updateClientField('tipo', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pf">Pessoa Física</SelectItem>
                      <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documento">Documento (CPF/CNPJ)</Label>
                <Input
                  id="documento"
                  value={client.documento || ''}
                  onChange={(e) => updateClientField('documento', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={client.endereco || ''}
                    onChange={(e) => updateClientField('endereco', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={client.numero || ''}
                    onChange={(e) => updateClientField('numero', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={client.bairro || ''}
                    onChange={(e) => updateClientField('bairro', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={client.cidade || ''}
                    onChange={(e) => updateClientField('cidade', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={client.estado || ''}
                    onChange={(e) => updateClientField('estado', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={client.cep || ''}
                  onChange={(e) => updateClientField('cep', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button onClick={handleSaveClient} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Dados Pessoais'
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Veículos do Cliente</h3>
              <Button onClick={() => setIsAddingVehicle(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Veículo
              </Button>
            </div>

            {vehiclesLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            {vehicle.marca} {vehicle.modelo} {vehicle.ano}
                          </CardTitle>
                          <CardDescription>
                            Placa: {vehicle.placa} {vehicle.cor && `• Cor: ${vehicle.cor}`}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingVehicle(vehicle)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}

                {vehicles.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum veículo cadastrado</p>
                  </div>
                )}
              </div>
            )}

            {/* Formulário para adicionar veículo */}
            {isAddingVehicle && (
              <Card>
                <CardHeader>
                  <CardTitle>Novo Veículo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-marca">Marca *</Label>
                      <Input
                        id="new-marca"
                        value={newVehicle.marca || ''}
                        onChange={(e) => updateNewVehicleField('marca', e.target.value)}
                        placeholder="Ex: Toyota"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-modelo">Modelo *</Label>
                      <Input
                        id="new-modelo"
                        value={newVehicle.modelo || ''}
                        onChange={(e) => updateNewVehicleField('modelo', e.target.value)}
                        placeholder="Ex: Corolla"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-ano">Ano *</Label>
                      <Input
                        id="new-ano"
                        value={newVehicle.ano || ''}
                        onChange={(e) => updateNewVehicleField('ano', e.target.value)}
                        placeholder="2020"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-placa">Placa *</Label>
                      <Input
                        id="new-placa"
                        value={newVehicle.placa || ''}
                        onChange={(e) => updateNewVehicleField('placa', e.target.value)}
                        placeholder="ABC-1234"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-cor">Cor</Label>
                      <Input
                        id="new-cor"
                        value={newVehicle.cor || ''}
                        onChange={(e) => updateNewVehicleField('cor', e.target.value)}
                        placeholder="Branco"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-km">Kilometragem</Label>
                      <Input
                        id="new-km"
                        value={newVehicle.kilometragem || ''}
                        onChange={(e) => updateNewVehicleField('kilometragem', e.target.value)}
                        placeholder="50000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-combustivel">Combustível</Label>
                      <Select
                        value={newVehicle.tipo_combustivel || ''}
                        onValueChange={(value) => updateNewVehicleField('tipo_combustivel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o combustível" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gasolina">Gasolina</SelectItem>
                          <SelectItem value="etanol">Etanol</SelectItem>
                          <SelectItem value="flex">Flex</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="gnv">GNV</SelectItem>
                          <SelectItem value="eletrico">Elétrico</SelectItem>
                          <SelectItem value="hibrido">Híbrido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => {
                      setIsAddingVehicle(false);
                      setNewVehicle({});
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddVehicle}>
                      Adicionar Veículo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Modal para editar veículo */}
            {editingVehicle && (
              <Card>
                <CardHeader>
                  <CardTitle>Editar Veículo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-marca">Marca *</Label>
                      <Input
                        id="edit-marca"
                        value={editingVehicle.marca}
                        onChange={(e) => updateVehicleField('marca', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-modelo">Modelo *</Label>
                      <Input
                        id="edit-modelo"
                        value={editingVehicle.modelo}
                        onChange={(e) => updateVehicleField('modelo', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-ano">Ano *</Label>
                      <Input
                        id="edit-ano"
                        value={editingVehicle.ano}
                        onChange={(e) => updateVehicleField('ano', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-placa">Placa *</Label>
                      <Input
                        id="edit-placa"
                        value={editingVehicle.placa}
                        onChange={(e) => updateVehicleField('placa', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-cor">Cor</Label>
                      <Input
                        id="edit-cor"
                        value={editingVehicle.cor || ''}
                        onChange={(e) => updateVehicleField('cor', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-km">Kilometragem</Label>
                      <Input
                        id="edit-km"
                        value={editingVehicle.kilometragem || ''}
                        onChange={(e) => updateVehicleField('kilometragem', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-combustivel">Combustível</Label>
                      <Select
                        value={editingVehicle.tipo_combustivel || ''}
                        onValueChange={(value) => updateVehicleField('tipo_combustivel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o combustível" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gasolina">Gasolina</SelectItem>
                          <SelectItem value="etanol">Etanol</SelectItem>
                          <SelectItem value="flex">Flex</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="gnv">GNV</SelectItem>
                          <SelectItem value="eletrico">Elétrico</SelectItem>
                          <SelectItem value="hibrido">Híbrido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setEditingVehicle(null)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdateVehicle}>
                      Salvar Alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={onSave}>
            Concluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientEditDialogTabs;