
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { callAI } from '@/services/aiService';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  user_id?: string;
}

const IASuporteInteligentePage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Sou sua assistente de IA para suporte técnico. Como posso ajudá-lo hoje?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      loadMessageHistory();
    }
  }, [user]);

  const loadMessageHistory = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('ia_suporte_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar histórico:', error);
        return;
      }

      if (data && data.length > 0) {
        const historyMessages = data.map(msg => ({
          id: msg.id,
          content: msg.content,
          isBot: msg.is_bot,
          timestamp: new Date(msg.created_at),
          user_id: msg.user_id
        }));
        
        setMessages(prev => [prev[0], ...historyMessages]); // Keep welcome message first
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveMessage = async (message: Message) => {
    if (!user) return;

    try {
      await supabase
        .from('ia_suporte_messages')
        .insert({
          user_id: user.id,
          content: message.content,
          is_bot: message.isBot,
          created_at: message.timestamp.toISOString()
        });
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date(),
      user_id: user.id
    };

    setMessages(prev => [...prev, userMessage]);
    await saveMessage(userMessage);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await callAI('suporte', inputMessage);
      
      if (response.success && response.answer) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.answer,
          isBot: true,
          timestamp: new Date(),
          user_id: user.id
        };
        setMessages(prev => [...prev, botMessage]);
        await saveMessage(botMessage);
      } else {
        throw new Error(response.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao obter resposta da IA:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        isBot: true,
        timestamp: new Date(),
        user_id: user.id
      };
      setMessages(prev => [...prev, errorMessage]);
      await saveMessage(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Erro na IA",
        description: "Não foi possível obter resposta da IA."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoadingHistory) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Carregando conversa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bot className="h-10 w-10 text-blue-600 bg-blue-100 rounded-full p-2" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h1 className="text-lg font-semibold">IA Suporte Inteligente</h1>
            <p className="text-sm text-gray-500">Online • Sempre disponível</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
              {message.isBot && (
                <Bot className="h-6 w-6 text-blue-600 bg-blue-100 rounded-full p-1 flex-shrink-0 mt-1" />
              )}
              {!message.isBot && (
                <User className="h-6 w-6 text-white bg-blue-600 rounded-full p-1 flex-shrink-0 mt-1" />
              )}
              <div
                className={`px-4 py-2 rounded-2xl shadow-sm ${
                  message.isBot
                    ? 'bg-white text-gray-800 rounded-bl-md'
                    : 'bg-blue-600 text-white rounded-br-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.isBot ? 'text-gray-400' : 'text-blue-100'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
              <Bot className="h-6 w-6 text-blue-600 bg-blue-100 rounded-full p-1 flex-shrink-0 mt-1" />
              <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-400">Digitando...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            className="flex-1 rounded-full"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
            className="rounded-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IASuporteInteligentePage;
