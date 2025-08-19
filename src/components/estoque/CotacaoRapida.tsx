
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CotacaoRapidaProps {
  produto: {
    id: string;
    nome: string;
    codigo?: string;
  };
  fornecedores: {
    id: string;
    nome: string;
    telefone?: string;
  }[];
}

const CotacaoRapida: React.FC<CotacaoRapidaProps> = ({ produto, fornecedores }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<string>('');
  const [quantidade, setQuantidade] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');
  const { toast } = useToast();

  const handleEnviarCotacao = () => {
    const fornecedor = fornecedores.find(f => f.id === fornecedorSelecionado);
    
    if (!fornecedor?.telefone) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Fornecedor não possui telefone cadastrado.",
      });
      return;
    }

    const mensagem = `
Olá ${fornecedor.nome}!

Gostaria de solicitar uma cotação para:

*Produto:* ${produto.nome}
${produto.codigo ? `*Código:* ${produto.codigo}` : ''}
*Quantidade:* ${quantidade}

${observacoes ? `*Observações:* ${observacoes}` : ''}

Aguardo retorno com preço e prazo de entrega.

Obrigado!
    `.trim();

    const telefone = fornecedor.telefone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Cotação enviada",
      description: `Mensagem enviada para ${fornecedor.nome} via WhatsApp.`,
    });
    
    setIsOpen(false);
    setFornecedorSelecionado('');
    setQuantidade('');
    setObservacoes('');
  };

  if (fornecedores.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageCircle className="mr-2 h-4 w-4" />
          Cotação Rápida
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Cotação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Produto: {produto.nome}</p>
            {produto.codigo && (
              <p className="text-xs text-gray-600">Código: {produto.codigo}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Fornecedor</label>
            <Select value={fornecedorSelecionado} onValueChange={setFornecedorSelecionado}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione um fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {fornecedores.filter(f => f.telefone).map((fornecedor) => (
                  <SelectItem key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Quantidade</label>
            <input
              type="number"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Quantidade desejada"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Observações (opcional)</label>
            <Textarea
              className="mt-1"
              placeholder="Informações adicionais..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleEnviarCotacao}
              disabled={!fornecedorSelecionado || !quantidade}
            >
              <Send className="mr-2 h-4 w-4" />
              Enviar via WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CotacaoRapida;
