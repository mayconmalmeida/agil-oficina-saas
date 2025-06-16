
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { callAI } from '@/services/aiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const SuporteIA: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Olá! Sou seu assistente inteligente do OficinaCloud. Como posso ajudar com o sistema hoje?',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return null;
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      sender: 'user',
      text: message,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, newMessage]);
    setMessage('');
    setLoading(true);

    try {
      console.log('Enviando mensagem para IA de suporte:', newMessage.text);
      
      const aiResponse = await callAI('suporte', newMessage.text);
      console.log('Resposta da IA de suporte recebida:', aiResponse);
      
      const aiMessage: ChatMessage = {
        sender: 'ai',
        text: aiResponse.success && aiResponse.answer 
          ? aiResponse.answer 
          : 'Desculpe, houve um problema ao processar sua pergunta. Tente novamente ou reformule sua pergunta.',
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, aiMessage]);

      if (!aiResponse.success) {
        toast({
          variant: "destructive",
          title: "Erro no suporte",
          description: aiResponse.error || "Não foi possível processar sua pergunta.",
        });
      }
    } catch (error) {
      console.error("Erro no suporte IA:", error);
      const errorMessage: ChatMessage = {
        sender: 'ai',
        text: 'Ocorreu um erro ao processar sua pergunta. Verifique sua conexão e tente novamente.',
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorMessage]);
      
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Não foi possível conectar com o suporte inteligente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="bg-white shadow-lg max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <MessageCircle className="h-5 w-5 text-green-600" />
          Suporte Inteligente
        </CardTitle>
        <CardDescription>
          Assistente virtual especializado no sistema OficinaCloud
        </CardDescription>
        <Badge variant="outline" className="w-fit text-green-700 border-green-300">
          Online 24/7
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-64 border border-gray-200 rounded-md p-3 bg-gray-50">
          <div className="space-y-3">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 p-2 rounded-lg rounded-bl-none">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-sm">Analisando sua pergunta...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder="Como posso ajudar com o sistema?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !message.trim()}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuporteIA;
