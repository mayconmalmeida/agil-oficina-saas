import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageCircle, User, Phone } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  isSupport: boolean;
  timestamp: Date;
}

const SupportChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [supportStatus, setSupportStatus] = useState<'offline' | 'online' | 'typing'>('offline');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userProfile } = useUserProfile();
  const { toast } = useToast();

  const supportPhone = userProfile?.whatsapp_suporte || '46999324779';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Simular conexão com suporte
    const connectToSupport = setTimeout(() => {
      setIsConnected(true);
      setSupportStatus('online');
      addSupportMessage("Olá! Sou da equipe de suporte. Como posso ajudar você hoje? 😊");
    }, 2000);

    return () => clearTimeout(connectToSupport);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addSupportMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      content,
      isSupport: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      content,
      isSupport: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    addUserMessage(newMessage);
    
    // Simular envio via WhatsApp
    const whatsappUrl = `https://wa.me/${supportPhone}?text=${encodeURIComponent(newMessage)}`;
    
    // Abrir WhatsApp em nova aba
    window.open(whatsappUrl, '_blank');

    // Simular resposta do suporte
    setSupportStatus('typing');
    setTimeout(() => {
      setSupportStatus('online');
      addSupportMessage("Recebi sua mensagem via WhatsApp! Vou responder por lá em breve. 📱");
    }, 3000);

    setNewMessage('');
    
    toast({
      title: "Mensagem enviada",
      description: "Sua mensagem foi enviada via WhatsApp. O suporte responderá em breve!",
    });
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

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-green-500 text-white">
              <MessageCircle className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">Suporte ao Vivo</CardTitle>
            <div className="flex items-center gap-2 text-sm text-green-100">
              <div className={`w-2 h-2 rounded-full ${
                supportStatus === 'online' ? 'bg-green-300' : 
                supportStatus === 'typing' ? 'bg-yellow-300' : 'bg-gray-300'
              }`} />
              <span>
                {supportStatus === 'online' ? 'Online' : 
                 supportStatus === 'typing' ? 'Digitando...' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-green-100">
              <Phone className="h-3 w-3" />
              <span>{formatPhoneNumber(supportPhone)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Área de mensagens */}
        <div className="h-80 overflow-y-auto p-4 bg-gradient-to-b from-green-50/30 to-white">
          {!isConnected ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Conectando ao suporte...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isSupport ? 'justify-start' : 'justify-end'}`}
                >
                  <div className="flex items-end gap-2 max-w-[85%]">
                    {message.isSupport && (
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarFallback className="bg-green-600 text-white text-xs">
                          S
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`px-3 py-2 rounded-2xl shadow-md ${
                        message.isSupport
                          ? 'bg-white border border-gray-200'
                          : 'bg-green-500 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p 
                        className={`text-xs mt-1 ${
                          message.isSupport 
                            ? 'text-gray-500'
                            : 'text-green-100'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>

                    {!message.isSupport && (
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}

              {supportStatus === 'typing' && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-green-600 text-white text-xs">
                        S
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
          )}
        </div>

        {/* Input de mensagem */}
        {isConnected && (
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="rounded-full"
                />
              </div>
              
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="rounded-full bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              📱 Suas mensagens serão enviadas via WhatsApp: {formatPhoneNumber(supportPhone)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupportChat;
