
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Brain, Loader2, Send, Bot } from 'lucide-react';
import { callAI } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const IASuporteInteligentePage: React.FC = () => {
  const [pergunta, setPergunta] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Sou o assistente virtual do OficinaCloud. Como posso ajudá-lo hoje?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pergunta.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, digite sua pergunta.",
      });
      return;
    }

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      content: pergunta,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setPergunta('');
    setIsLoading(true);

    try {
      const result = await callAI('suporte', pergunta);
      
      if (result.success && result.answer) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: result.answer,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao consultar IA:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        variant: "destructive",
        title: "Erro na consulta",
        description: error instanceof Error ? error.message : "Não foi possível processar sua pergunta.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-blue-100">
              <Bot className="h-5 w-5 text-blue-600" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold">IA Suporte Inteligente</h1>
            <p className="text-sm text-gray-500">Assistente Virtual OficinaCloud</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          <Brain className="h-4 w-4 mr-1" />
          Online
        </Badge>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] ${message.isUser ? 'order-2' : 'order-1'}`}>
              {!message.isUser && (
                <div className="flex items-center space-x-2 mb-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-blue-100 text-xs">
                      <Bot className="h-3 w-3 text-blue-600" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-500">IA Suporte</span>
                </div>
              )}
              
              <div
                className={`rounded-lg p-3 ${
                  message.isUser
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className={`text-xs mt-1 block ${
                  message.isUser ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[70%]">
              <div className="flex items-center space-x-2 mb-1">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-blue-100 text-xs">
                    <Bot className="h-3 w-3 text-blue-600" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-500">IA Suporte</span>
              </div>
              <div className="bg-gray-100 rounded-lg rounded-bl-sm p-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600">Digitando...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            placeholder="Digite sua pergunta sobre o sistema..."
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !pergunta.trim()}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Faça perguntas sobre funcionalidades, problemas técnicos ou dúvidas sobre o sistema.
        </p>
      </div>
    </div>
  );
};

export default IASuporteInteligentePage;
