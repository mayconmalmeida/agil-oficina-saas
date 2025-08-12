
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Bot, User, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Conversa {
  id: string;
  pergunta: string;
  resposta: string;
  created_at: string;
}

const IASupportPage: React.FC = () => {
  const [pergunta, setPergunta] = useState('');
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [oficina, setOficina] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadOficina();
    loadConversas();
  }, []);

  const loadOficina = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('oficinas')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!error && data) {
        setOficina(data);
      }
    } catch (error) {
      console.error('Erro ao carregar oficina:', error);
    }
  };

  const loadConversas = async () => {
    try {
      const { data, error } = await supabase
        .from('ia_suporte_conversas')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        setConversas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    }
  };

  const enviarPergunta = async () => {
    if (!pergunta.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, digite sua pergunta.",
      });
      return;
    }

    if (!oficina) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Oficina não encontrada. Faça login novamente.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simular resposta da IA (aqui você integraria com OpenAI ou outra API)
      const respostaIA = await simularRespostaIA(pergunta);

      // Salvar conversa no banco
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error } = await supabase
          .from('ia_suporte_conversas')
          .insert({
            oficina_id: oficina.id,
            user_id: session.user.id,
            pergunta: pergunta,
            resposta: respostaIA
          });

        if (error) {
          console.error('Erro ao salvar conversa:', error);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Erro ao salvar a conversa.",
          });
        } else {
          // Adicionar à lista local
          const novaConversa: Conversa = {
            id: Date.now().toString(),
            pergunta,
            resposta: respostaIA,
            created_at: new Date().toISOString()
          };
          setConversas(prev => [...prev, novaConversa]);
          setPergunta('');
          
          toast({
            title: "Sucesso",
            description: "Pergunta enviada com sucesso!",
          });
        }
      }
    } catch (error) {
      console.error('Erro ao enviar pergunta:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao processar sua pergunta.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simularRespostaIA = async (pergunta: string): Promise<string> => {
    // Simulação básica - aqui você integraria com OpenAI
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const respostasExemplo = [
      "Com base na sua pergunta sobre gestão de oficina, recomendo implementar um sistema de controle de estoque mais rigoroso...",
      "Para melhorar o atendimento ao cliente, sugiro criar um sistema de agendamento online e acompanhamento de serviços...",
      "Sobre precificação de serviços, é importante considerar custos de mão de obra, peças e margem de lucro adequada...",
      "Para organizar melhor sua oficina, recomendo implementar um sistema de gestão integrado que controle desde o orçamento até a entrega..."
    ];
    
    return respostasExemplo[Math.floor(Math.random() * respostasExemplo.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarPergunta();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[700px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-blue-600" />
              IA Suporte Inteligente
            </CardTitle>
            <p className="text-muted-foreground">
              Tire suas dúvidas sobre gestão de oficina com nossa IA especializada
            </p>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            {/* Área de conversas */}
            <ScrollArea className="flex-1 mb-4 p-4 border rounded-lg bg-gray-50">
              {conversas.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhuma conversa ainda. Faça sua primeira pergunta!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversas.map((conversa) => (
                    <div key={conversa.id} className="space-y-2">
                      {/* Pergunta do usuário */}
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-600 rounded-full p-1">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-blue-100 rounded-lg p-3 max-w-[80%]">
                          <p className="text-sm">{conversa.pergunta}</p>
                        </div>
                      </div>
                      
                      {/* Resposta da IA */}
                      <div className="flex items-start gap-3">
                        <div className="bg-green-600 rounded-full p-1">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-white border rounded-lg p-3 max-w-[80%]">
                          <p className="text-sm">{conversa.resposta}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(conversa.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            {/* Campo de input */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Digite sua pergunta sobre gestão de oficina..."
                value={pergunta}
                onChange={(e) => setPergunta(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="resize-none"
                rows={3}
              />
              <Button
                onClick={enviarPergunta}
                disabled={isLoading || !pergunta.trim()}
                className="px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IASupportPage;
