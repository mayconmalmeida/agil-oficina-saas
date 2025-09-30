
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, Mail, Clock, MapPin, ArrowLeft } from 'lucide-react';

const SupportPage = () => {
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/5546999324779', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/dashboard" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Central de Suporte
            </h1>
            <p className="text-xl text-gray-600">
              Estamos aqui para ajudar você a aproveitar ao máximo o OficinaGO
            </p>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="">
            <CardContent className="p-6">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                Contato Direto
              </CardTitle>
              <CardDescription className="">
                Entre em contato conosco através dos nossos canais oficiais
              </CardDescription>
              
              <div className="space-y-4 mt-6">
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
                  <Button size="sm" variant="outline" className="">
                    Ligar
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
                  <Button size="sm" variant="outline" className="">
                    Enviar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardContent className="p-6">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Horário de Atendimento
              </CardTitle>
              <CardDescription className="">
                Nossos horários de funcionamento para suporte
              </CardDescription>
              
              <div className="space-y-2 mt-6">
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
                  Atendimento remoto via WhatsApp, telefone e e-mail
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="">
          <CardContent className="p-6">
            <CardTitle className="">Perguntas Frequentes</CardTitle>
            <CardDescription className="">
              Respostas para as dúvidas mais comuns sobre o OficinaGO
            </CardDescription>
            
            <div className="space-y-4 mt-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Como faço para começar a usar o OficinaGO?</h3>
                <p className="text-sm text-gray-600">
                  Após se cadastrar, você será direcionado para configurar seu perfil da oficina. 
                  Complete as informações básicas e comece a cadastrar seus clientes e veículos.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Posso cancelar minha assinatura a qualquer momento?</h3>
                <p className="text-sm text-gray-600">
                  Sim, você pode cancelar sua assinatura a qualquer momento através das configurações 
                  da conta ou entrando em contato conosco.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Os meus dados ficam seguros?</h3>
                <p className="text-sm text-gray-600">
                  Sim, utilizamos criptografia de ponta e seguimos as melhores práticas de segurança 
                  para proteger seus dados e os de seus clientes.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Como posso gerar relatórios?</h3>
                <p className="text-sm text-gray-600">
                  Acesse a seção "Relatórios" no menu principal. Lá você encontrará diversos tipos 
                  de relatórios que podem ser filtrados por período e exportados.
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
