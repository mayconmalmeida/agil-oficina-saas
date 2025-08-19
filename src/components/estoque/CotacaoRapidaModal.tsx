
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { MessageCircle, Send } from 'lucide-react';

interface CotacaoRapidaModalProps {
  isOpen: boolean;
  onClose: () => void;
  produtoId?: string;
  ordemServicoId?: string;
}

interface Fornecedor {
  id: string;
  name: string;
  phone?: string;
}

const CotacaoRapidaModal: React.FC<CotacaoRapidaModalProps> = ({
  isOpen,
  onClose,
  produtoId,
  ordemServicoId
}) => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [formData, setFormData] = useState({
    fornecedor_id: '',
    produtos: [{ nome: '', quantidade: 1, observacao: '' }],
    observacoes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchFornecedores();
      
      // Se foi passado um produto específico, pré-preencher
      if (produtoId) {
        fetchProdutoInfo(produtoId);
      }
    }
  }, [isOpen, produtoId]);

  const fetchFornecedores = async () => {
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .select('id, name, phone')
        .eq('ativo', true);

      if (error) throw error;
      setFornecedores(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar fornecedores",
        description: error.message
      });
    }
  };

  const fetchProdutoInfo = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('nome')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        produtos: [{ nome: data.nome, quantidade: 1, observacao: '' }]
      }));
    } catch (error: any) {
      console.error('Erro ao buscar produto:', error);
    }
  };

  const adicionarProduto = () => {
    setFormData(prev => ({
      ...prev,
      produtos: [...prev.produtos, { nome: '', quantidade: 1, observacao: '' }]
    }));
  };

  const atualizarProduto = (index: number, campo: string, valor: any) => {
    setFormData(prev => ({
      ...prev,
      produtos: prev.produtos.map((produto, i) => 
        i === index ? { ...produto, [campo]: valor } : produto
      )
    }));
  };

  const removerProduto = (index: number) => {
    if (formData.produtos.length > 1) {
      setFormData(prev => ({
        ...prev,
        produtos: prev.produtos.filter((_, i) => i !== index)
      }));
    }
  };

  const enviarCotacao = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Salvar cotação no banco
      const { error } = await supabase
        .from('cotacoes_fornecedor')
        .insert([{
          user_id: user.id,
          fornecedor_id: formData.fornecedor_id,
          produtos: formData.produtos,
          observacoes: formData.observacoes,
          ordem_servico_id: ordemServicoId,
          status: 'enviado'
        }]);

      if (error) throw error;

      // Preparar mensagem para WhatsApp
      const fornecedor = fornecedores.find(f => f.id === formData.fornecedor_id);
      if (fornecedor?.phone) {
        const mensagem = gerarMensagemWhatsApp(formData.produtos, formData.observacoes);
        const whatsappUrl = `https://wa.me/55${fornecedor.phone.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`;
        window.open(whatsappUrl, '_blank');
      }

      toast({
        title: "Cotação enviada com sucesso!",
        description: fornecedor?.phone 
          ? "O WhatsApp foi aberto para envio da mensagem." 
          : "Cotação salva no sistema."
      });

      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar cotação",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const gerarMensagemWhatsApp = (produtos: any[], observacoes: string) => {
    let mensagem = "🔧 *Solicitação de Cotação*\n\n";
    mensagem += "Prezado fornecedor,\n\n";
    mensagem += "Gostaria de solicitar cotação para os seguintes itens:\n\n";
    
    produtos.forEach((produto, index) => {
      mensagem += `${index + 1}. *${produto.nome}*\n`;
      mensagem += `   Quantidade: ${produto.quantidade}\n`;
      if (produto.observacao) {
        mensagem += `   Obs: ${produto.observacao}\n`;
      }
      mensagem += "\n";
    });

    if (observacoes) {
      mensagem += `*Observações gerais:*\n${observacoes}\n\n`;
    }

    mensagem += "Por favor, nos envie o preço e prazo de entrega.\n\n";
    mensagem += "Obrigado!";

    return mensagem;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cotação Rápida para Fornecedor</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="fornecedor">Fornecedor</Label>
            <Select 
              value={formData.fornecedor_id} 
              onValueChange={(value) => setFormData({...formData, fornecedor_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {fornecedores.map((fornecedor) => (
                  <SelectItem key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.name} {fornecedor.phone && `- ${fornecedor.phone}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Produtos</Label>
              <Button type="button" variant="outline" size="sm" onClick={adicionarProduto}>
                Adicionar Produto
              </Button>
            </div>
            
            {formData.produtos.map((produto, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Produto {index + 1}</span>
                  {formData.produtos.length > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => removerProduto(index)}
                    >
                      Remover
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Nome do Produto</Label>
                    <Input
                      value={produto.nome}
                      onChange={(e) => atualizarProduto(index, 'nome', e.target.value)}
                      placeholder="Ex: Filtro de óleo"
                      required
                    />
                  </div>
                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      min="1"
                      value={produto.quantidade}
                      onChange={(e) => atualizarProduto(index, 'quantidade', parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Observações do Produto</Label>
                  <Input
                    value={produto.observacao}
                    onChange={(e) => atualizarProduto(index, 'observacao', e.target.value)}
                    placeholder="Marca preferencial, especificações técnicas..."
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <Label htmlFor="observacoes">Observações Gerais</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              placeholder="Prazo de entrega, condições de pagamento, etc..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={enviarCotacao}
              disabled={!formData.fornecedor_id || formData.produtos.some(p => !p.nome) || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                "Enviando..."
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar via WhatsApp
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CotacaoRapidaModal;
