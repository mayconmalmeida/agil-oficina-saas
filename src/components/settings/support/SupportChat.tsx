
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Send, MessageCircle, User, Clock, CheckCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  sender_type: 'user' | 'admin';
  sender_name?: string;
  timestamp: Date;
  read: boolean;
}

const SupportChat: React.FC = () => {
  const { userProfile } = useUserProfile();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
    
    // Simular presença do admin (em produção, seria real-time)
    const adminPresenceTimer = setInterval(() => {
      setIsOnline(Math.random() > 0.3); // 70% chance de estar online
    }, 30000);

    return () => clearInterval(adminPresenceTimer);
  }, []);

  const loadChatHistory = async () => {
    if (!userProfile?.id) return;

    try {
      // Simular carregamento do histórico do chat
      // Em produção, seria uma consulta real ao banco
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          content: 'Olá! Como posso ajudá-lo hoje?',
          sender_type: 'admin',
          sender_name: 'Suporte OficinaCloud',
          timestamp: new Date(Date.now() - 3600000),
          read: true
        }
      ];
      
      setMessages(mockMessages);
      setIsOnline(true);
    } catch (error) {
      console.error('Erro ao carregar histórico do chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading || !userProfile?.id) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender_type: 'user',
      sender_name: userProfile.nome_oficina || 'Usuário',
      timestamp: new Date(),
      read: false
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // Simular envio da mensagem para o admin
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simular resposta automática do admin
      setTimeout(() => {
        const adminResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: 'Obrigado por entrar em contato! Recebemos sua mensagem e responderemos em breve. Para questões urgentes, entre em contato pelo WhatsApp.',
          sender_type: 'admin',
          sender_name: 'Suporte OficinaCloud',
          timestamp: new Date(),
          read: true
        };
        
        setMessages(prev => [...prev, adminResponse]);
        
        toast({
          title: "Mensagem enviada",
          description: "Nossa equipe responderá em breve.",
        });
      }, 2000);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2 border-b">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <MessageCircle className="h-8 w-8 text-blue-600" />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
          <div>
            <CardTitle className="text-lg">Chat com Suporte</CardTitle>
            <p className="text-sm text-muted-foreground">
              {isOnline ? 'Equipe online' : 'Equipe offline'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                message.sender_type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender_type === 'user' 
                    ? 'bg-blue-600 text-white'
                    : 'bg-green-600 text-white'
                }`}>
                  {message.sender_type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                </div>
                
                <div
                  className={`px-4 py-2 rounded-2xl shadow-sm ${
                    message.sender_type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md border'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div className={`flex items-center justify-between mt-1 text-xs ${
                    message.sender_type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {message.sender_type === 'user' && (
                      <div className="flex items-center space-x-1">
                        {message.read ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl rounded-bl-md shadow-sm border">
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
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            {isOnline 
              ? 'Nossa equipe está online e responderá em breve'
              : 'Nossa equipe está offline. Deixe sua mensagem que responderemos assim que possível'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportChat;
