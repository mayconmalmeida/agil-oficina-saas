
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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

interface ClientEditDialogProps {
  clientId: string;
  onClose: () => void;
  onSave: () => void;
}

const ClientEditDialog: React.FC<ClientEditDialogProps> = ({ clientId, onClose, onSave }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

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

  const handleSave = async () => {
    if (!client) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          nome: client.nome,
          telefone: client.telefone,
          email: client.email,
          veiculo: client.veiculo,
          marca: client.marca,
          modelo: client.modelo,
          ano: client.ano,
          placa: client.placa,
          cor: client.cor,
          tipo: client.tipo,
          endereco: client.endereco,
          cidade: client.cidade,
          estado: client.estado,
          cep: client.cep,
          documento: client.documento,
          kilometragem: client.kilometragem,
          bairro: client.bairro,
          numero: client.numero
        })
        .eq('id', clientId);

      if (error) throw error;

      onSave();
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

  const updateField = (field: keyof Client, value: string) => {
    if (client) {
      setClient({ ...client, [field]: value });
    }
  };

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={client.nome}
                onChange={(e) => updateField('nome', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={client.telefone}
                onChange={(e) => updateField('telefone', e.target.value)}
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
                onChange={(e) => updateField('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={client.tipo} onValueChange={(value) => updateField('tipo', value)}>
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
              onChange={(e) => updateField('documento', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={client.marca || ''}
                onChange={(e) => updateField('marca', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={client.modelo || ''}
                onChange={(e) => updateField('modelo', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano">Ano</Label>
              <Input
                id="ano"
                value={client.ano || ''}
                onChange={(e) => updateField('ano', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="placa">Placa</Label>
              <Input
                id="placa"
                value={client.placa || ''}
                onChange={(e) => updateField('placa', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cor">Cor</Label>
              <Input
                id="cor"
                value={client.cor || ''}
                onChange={(e) => updateField('cor', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kilometragem">Kilometragem</Label>
              <Input
                id="kilometragem"
                value={client.kilometragem || ''}
                onChange={(e) => updateField('kilometragem', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="veiculo">Descrição do Veículo *</Label>
            <Textarea
              id="veiculo"
              value={client.veiculo}
              onChange={(e) => updateField('veiculo', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={client.endereco || ''}
                onChange={(e) => updateField('endereco', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={client.numero || ''}
                onChange={(e) => updateField('numero', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={client.bairro || ''}
                onChange={(e) => updateField('bairro', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={client.cidade || ''}
                onChange={(e) => updateField('cidade', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={client.estado || ''}
                onChange={(e) => updateField('estado', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              value={client.cep || ''}
              onChange={(e) => updateField('cep', e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientEditDialog;
