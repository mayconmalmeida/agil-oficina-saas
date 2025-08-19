
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, Mail, Clock, MapPin } from 'lucide-react';

const SupportPage = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = '5546999324779';
    const message = encodeURIComponent('Olá! Preciso de suporte com o OficinaGO.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Central de Suporte
          </h1>
          <p className="text-xl text-gray-600">
            Estamos aqui para ajudar você a aproveitar ao máximo o OficinaGO
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Canais de Suporte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Canais de Suporte
              </CardTitle>
              <CardDescription>
                Entre em contato através dos nossos canais oficiais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">WhatsApp Business</p>
                    <p className="text-sm text-gray-600">(46) 9 9932-4779</p>
                  </div>
                </div>
                <Button onClick={handleWhatsAppClick} size="sm" className="bg-green-600 hover:bg-green-700">
                  Conversar
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Telefone</p>
                    <p className="text-sm text-gray-600">(46) 9 9932-4779</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <a href="tel:+5546999324779">Ligar</a>
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">E-mail</p>
                    <p className="text-sm text-gray-600">contatooficinago@gmail.com</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <a href="mailto:contatooficinago@gmail.com">Enviar</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Horário de Atendimento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horário de Atendimento
              </CardTitle>
              <CardDescription>
                Nossos horários para melhor atendê-lo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 border-b">
                  <span className="font-medium">Segunda a Sexta</span>
                  <span className="text-gray-600">08:00 - 18:00</span>
                </div>
                <div className="flex justify-between items-center p-2 border-b">
                  <span className="font-medium">Sábado</span>
                  <span className="text-gray-600">08:00 - 12:00</span>
                </div>
                <div className="flex justify-between items-center p-2">
                  <span className="font-medium">Domingo</span>
                  <span className="text-gray-600">Fechado</span>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Localização</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Pato Branco - PR, Brasil
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Rápido */}
        <Card>
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
            <CardDescription>
              Respostas rápidas para as dúvidas mais comuns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Como faço para começar a usar o OficinaGO?</h3>
                <p className="text-sm text-gray-600">
                  Após o cadastro, você terá 7 dias de teste gratuito para explorar todas as funcionalidades do sistema.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Posso cancelar minha assinatura a qualquer momento?</h3>
                <p className="text-sm text-gray-600">
                  Sim, você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Os meus dados ficam seguros?</h3>
                <p className="text-sm text-gray-600">
                  Sim, utilizamos criptografia e as melhores práticas de segurança para proteger suas informações.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Como posso gerar relatórios?</h3>
                <p className="text-sm text-gray-600">
                  Acesse a seção "Relatórios" no menu lateral para gerar relatórios detalhados sobre seu negócio.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupportPage;
