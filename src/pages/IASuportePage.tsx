
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  is_bot: boolean;
  created_at: string;
}

const IASuportePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ia_suporte_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar mensagens",
        description: error.message
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Salvar mensagem do usuário
      const { error: userError } = await supabase
        .from('ia_suporte_messages')
        .insert({
          user_id: user.id,
          content: userMessage,
          is_bot: false
        });

      if (userError) throw userError;

      // Simular resposta da IA (substituir por integração real)
      const botResponse = `Olá! Obrigado por usar o Oficina Go. Sua mensagem "${userMessage}" foi recebida. Como posso ajudá-lo com o sistema de gestão da sua oficina?`;

      // Salvar resposta da IA
      const { error: botError } = await supabase
        .from('ia_suporte_messages')
        .insert({
          user_id: user.id,
          content: botResponse,
          is_bot: true
        });

      if (botError) throw botError;

      // Recarregar mensagens
      await loadMessages();

    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar mensagem",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('ia_suporte_messages')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setMessages([]);
      toast({
        title: "Conversa limpa",
        description: "Todas as mensagens foram removidas."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao limpar conversa",
        description: error.message
      });
    }
  };

  if (loadingMessages) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando conversa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">IA Suporte Inteligente</h1>
          <p className="text-gray-600">Tire suas dúvidas sobre o Oficina Go</p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" onClick={clearMessages}>
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Conversa
          </Button>
        )}
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="h-5 w-5 mr-2 text-blue-600" />
            Assistente Oficina Go
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 mb-4 pr-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bot className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Olá! Como posso ajudá-lo com o Oficina Go hoje?</p>
                <p className="text-sm mt-2">Digite sua pergunta abaixo para começar.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_bot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`flex max-w-[80%] ${
                        message.is_bot ? 'flex-row' : 'flex-row-reverse'
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 ${
                          message.is_bot ? 'mr-3' : 'ml-3'
                        }`}
                      >
                        {message.is_bot ? (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-blue-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div
                        className={`rounded-lg p-3 ${
                          message.is_bot
                            ? 'bg-blue-50 text-blue-900'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.created_at).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua pergunta sobre o Oficina Go..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !inputMessage.trim()}
              className="px-4"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IASuportePage;
