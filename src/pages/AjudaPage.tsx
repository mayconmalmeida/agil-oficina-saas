import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { initializeWhatsAppChat } from '@/services/whatsappService';
import { MessageCircle } from 'lucide-react';

const AjudaPage: React.FC = () => {
  const handleWhatsApp = () => {
    const numero = '5546999324779';
    const mensagem = 'Olá! Preciso de ajuda ou quero reportar um erro no sistema.';
    initializeWhatsAppChat(numero, mensagem);
  };

  return (
    <div className="p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Ajuda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Precisa de suporte? Você pode solicitar ajuda ou reportar algum erro no sistema.
            Clique no botão abaixo para falar conosco via WhatsApp.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleWhatsApp} className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Falar no WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AjudaPage;