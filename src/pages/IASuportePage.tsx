import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, Mic, MicOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { generateSmartBotResponse } from '@/services/aiSuportService';
import { sanitizeInput } from '@/utils/sanitize';

interface Message {
  id: string;
  content: string;
  is_bot: boolean;
  created_at: string;
}

const IASuportePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchMessages();
    }
  }, [user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('ia_suporte_messages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;

    const userMessage = {
      content: newMessage,
      is_bot: false,
      user_id: user.id,
    };

    try {
      setIsLoading(true);

      // Salvar mensagem do usuário
      const { data: savedMessage, error } = await supabase
        .from('ia_suporte_messages')
        .insert(userMessage)
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, savedMessage]);
      setNewMessage('');

      // Gerar resposta inteligente baseada no contexto do sistema
      setTimeout(async () => {
        const botResponse = generateSmartBotResponse(newMessage);
        
        const { data: botMessage, error: botError } = await supabase
          .from('ia_suporte_messages')
          .insert({
            content: botResponse,
            is_bot: true,
            user_id: user.id,
          })
          .select()
          .single();

        if (botError) throw botError;

        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 1500);

    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar mensagem",
        description: error.message,
      });
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header estilo WhatsApp */}
        <Card className="mb-4 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="p-4 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-green-500 text-white">
                <Bot className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold">Suporte IA</h1>
              <p className="text-sm text-green-100">Online agora</p>
            </div>
          </div>
        </Card>

        {/* Container de mensagens estilo WhatsApp */}
        <Card className="h-[500px] flex flex-col bg-chat-bg bg-opacity-50">
          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <p className="text-lg font-medium">Olá! 👋</p>
                <p className="text-sm">Como posso ajudar você hoje?</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.is_bot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className="flex items-end gap-2 max-w-[85%]">
                    {message.is_bot && (
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarFallback className="bg-green-600 text-white text-xs">
                          <Bot className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                     <div
                      className={`px-3 py-2 rounded-2xl shadow-md ${
                        message.is_bot
                          ? 'bg-white border border-gray-200'
                          : 'bg-green-500 text-white ml-auto'
                      }`}
                    >
                      <div className="text-sm prose prose-sm max-w-none">
                        {message.is_bot ? (
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: sanitizeInput(
                                message.content
                                  .replace(/## (.*?)$/gm, '<h3 class="text-base font-semibold mb-2 text-green-700">$1</h3>')
                                  .replace(/### (.*?)$/gm, '<h4 class="text-sm font-medium mb-1 text-gray-700">$1</h4>')
                                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                                  .replace(/• (.*?)$/gm, '<li class="ml-4">$1</li>')
                                  .replace(/(\d+️⃣.*?)$/gm, '<div class="mt-2 mb-1 font-medium text-green-600">$1</div>')
                                  .replace(/💡 \*\*(.*?)\*\*/g, '<div class="mt-3 p-2 bg-yellow-50 rounded border-l-2 border-yellow-400"><span class="font-medium text-yellow-700">$1</span></div>')
                                  .replace(/✅ \*\*(.*?)\*\*/g, '<div class="mt-2 p-2 bg-green-50 rounded border-l-2 border-green-400"><span class="font-medium text-green-700">$1</span></div>')
                                  .replace(/🚗 \*\*(.*?)\*\*/g, '<div class="mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-400"><span class="font-medium text-blue-700">$1</span></div>')
                                  .replace(/---/g, '<hr class="my-3 border-gray-200" />')
                                  .replace(/\n\n/g, '</p><p class="mb-2">')
                                  .replace(/^/, '<p class="mb-2">')
                                  .replace(/$/, '</p>')
                              )
                            }} 
                          />
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                      <p 
                        className={`text-xs mt-1 ${
                          message.is_bot 
                            ? 'text-gray-500' 
                            : 'text-green-100'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>

                    {!message.is_bot && (
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-green-600 text-white text-xs">
                      <Bot className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white px-3 py-2 rounded-2xl border border-gray-200">
                     <div className="flex space-x-1">
                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                     </div>
                   </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input de mensagem estilo WhatsApp */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite uma mensagem..."
                  className="border-0 bg-transparent focus:ring-0 flex-1"
                  disabled={isLoading}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-gray-200"
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4 text-red-500" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isLoading}
                className="h-10 w-10 p-0 rounded-full bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🔒 Suas conversas são privadas e seguras
          </p>
        </div>
      </div>
    </div>
  );
};

export default IASuportePage;
