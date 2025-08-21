
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Loader2, Phone, Video, MoreVertical } from 'lucide-react';
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
        .from('ia_suporte_messages' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar histórico:', error);
        return;
      }

      if (data && data.length > 0) {
        const historyMessages = data.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          isBot: msg.is_bot,
          timestamp: new Date(msg.created_at),
          user_id: msg.user_id
        }));
        
        setMessages(prev => [prev[0], ...historyMessages]);
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
        .from('ia_suporte_messages' as any)
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-green-600" />
          <p className="text-green-700 dark:text-green-300">Carregando conversa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
      {/* Header estilo WhatsApp */}
      <div className="bg-green-600 dark:bg-green-700 text-white px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-green-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="font-semibold text-lg">IA Suporte</h1>
              <p className="text-xs text-green-100">online</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Phone className="h-5 w-5 text-green-100 hover:text-white cursor-pointer" />
            <Video className="h-5 w-5 text-green-100 hover:text-white cursor-pointer" />
            <MoreVertical className="h-5 w-5 text-green-100 hover:text-white cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Messages Area estilo WhatsApp */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iIzAwMDAwMCIgZmlsbC1vcGFjaXR5PSIwLjAzIi8+Cjwvc3ZnPgo=')] bg-repeat">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} mb-3`}
          >
            <div className={`flex items-end space-x-2 max-w-xs sm:max-w-md lg:max-w-lg ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
              {message.isBot && (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div
                className={`px-4 py-2 rounded-2xl shadow-sm relative ${
                  message.isBot
                    ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                    : 'bg-green-500 text-white rounded-br-sm'
                }`}
              >
                {/* Bubble tail */}
                <div
                  className={`absolute bottom-0 w-3 h-3 ${
                    message.isBot
                      ? '-left-1 bg-white dark:bg-gray-800'
                      : '-right-1 bg-green-500'
                  }`}
                  style={{
                    clipPath: message.isBot 
                      ? 'polygon(0 100%, 100% 0, 100% 100%)' 
                      : 'polygon(0 0, 0 100%, 100% 100%)'
                  }}
                />
                
                <p className="text-sm whitespace-pre-wrap leading-5">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.isBot ? 'text-gray-400 dark:text-gray-500' : 'text-green-100'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="flex items-end space-x-2 max-w-xs sm:max-w-md lg:max-w-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm relative">
                <div className="absolute bottom-0 -left-1 w-3 h-3 bg-white dark:bg-gray-800" 
                     style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }} />
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area estilo WhatsApp */}
      <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 min-h-[44px] flex items-center">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite uma mensagem..."
              disabled={isLoading}
              className="border-0 p-0 focus:ring-0 focus:outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
            className="rounded-full w-11 h-11 bg-green-500 hover:bg-green-600 text-white shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IASuporteInteligentePage;
