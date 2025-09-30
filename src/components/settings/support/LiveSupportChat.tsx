import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Phone, User, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { initializeWhatsAppChat } from '@/services/whatsappService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

const LiveSupportChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou o suporte da Oficina Go. Como posso ajudá-lo hoje?',
      sender: 'support',
      timestamp: new Date(),
      status: 'delivered'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Enviar mensagem para WhatsApp comercial
    try {
      const whatsappNumber = '46999324779';
      const messageText = `🏪 *Suporte Oficina Go*\n\n👤 *Cliente:* ${user?.nome_oficina || 'Usuário'}\n💬 *Mensagem:* ${newMessage}\n\n📅 *Data:* ${new Date().toLocaleString('pt-BR')}`;
      
      // Inicializar conversa no WhatsApp
      const success = await initializeWhatsAppChat(whatsappNumber, messageText);
      
      // Simular resposta automática do suporte
      setTimeout(() => {
        setIsTyping(false);
        const supportResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Recebemos sua mensagem! Nossa equipe irá respondê-lo em breve via WhatsApp.',
          sender: 'support',
          timestamp: new Date(),
          status: 'delivered'
        };
        setMessages(prev => [...prev, supportResponse]);
      }, 2000);

      // Marcar mensagem como entregue
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === userMessage.id 
              ? { ...msg, status: 'delivered' }
              : msg
          )
        );
      }, 1000);

      if (success) {
        toast({
          title: "Redirecionando para WhatsApp",
          description: "Você será redirecionado para conversar diretamente conosco!",
        });
      } else {
        throw new Error('Falha ao abrir WhatsApp');
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Suporte Oficina Go</CardTitle>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-muted-foreground">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        <div className="ml-auto">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            WhatsApp Integrado
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-green-50 to-white">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-green-500 text-white'
                    : 'bg-white border shadow-sm'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <div className={`flex items-center justify-between mt-1 text-xs ${
                  message.sender === 'user' ? 'text-green-100' : 'text-muted-foreground'
                }`}>
                  <span>
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {message.sender === 'user' && (
                    <span className={`ml-2 ${
                      message.status === 'read' ? 'text-blue-200' : ''
                    }`}>
                      {getStatusIcon(message.status)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border shadow-sm rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
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
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="icon"
              className="bg-green-500 hover:bg-green-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center">
            <MessageCircle className="w-3 h-3 mr-1" />
            Mensagens são enviadas para nosso WhatsApp: (46) 99932-4779
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveSupportChat;
