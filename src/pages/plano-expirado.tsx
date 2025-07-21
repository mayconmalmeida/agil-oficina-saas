
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from 'lucide-react';

const planos = [
  {
    nome: 'Essencial',
    preco: 'R$ 89,90',
    periodo: 'por mês',
    anualPreco: 'R$ 899,00 por ano (2 meses grátis)',
    beneficios: [
      'Cadastro de clientes ilimitado',
      'Gestão de orçamentos',
      'Controle de serviços',
      'Relatórios básicos',
      'Suporte via e-mail'
    ],
    urlMensal: 'https://pay.cakto.com.br/essencial-mensal',
    urlAnual: 'https://pay.cakto.com.br/essencial-anual'
  },
  {
    nome: 'Premium',
    preco: 'R$ 179,90',
    periodo: 'por mês',
    anualPreco: 'R$ 1.799,00 por ano (2 meses grátis)',
    beneficios: [
      'Tudo do plano Essencial, mais:',
      'Módulo de estoque integrado',
      'Agendamento de serviços',
      'Relatórios avançados',
      'Suporte prioritário',
      'Backup automático'
    ],
    isPremium: true,
    urlMensal: 'https://pay.cakto.com.br/premium-mensal',
    urlAnual: 'https://pay.cakto.com.br/premium-anual'
  }
];

const PlanoExpirado = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
    <Card className="w-full max-w-5xl">
      <CardContent className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            Seu período de teste acabou!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Para continuar usando o Oficina Ágil, escolha um plano abaixo:
          </p>
        </div>

        {/* Planos */}
        <div className="grid gap-8 md:grid-cols-2 mb-8">
          {planos.map((plano) => (
            <Card key={plano.nome} className={`relative ${plano.isPremium ? 'border-amber-200 bg-amber-50' : ''}`}>
              {plano.isPremium && (
                <div className="absolute -top-3 right-4 bg-amber-600 text-white text-xs px-3 py-1 rounded-full">
                  RECOMENDADO
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plano.nome}</h3>
                  <div className="text-3xl font-bold text-gray-900">{plano.preco}</div>
                  <div className="text-sm text-gray-500">{plano.periodo}</div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plano.beneficios.map((beneficio, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className={`text-sm ${index === 0 && plano.isPremium ? 'font-medium' : ''}`}>
                        {beneficio}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <div className="space-y-3">
                  <Button 
                    className={`w-full ${plano.isPremium ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    onClick={() => window.open(plano.urlMensal, '_blank')}
                  >
                    Assinar Mensal
                  </Button>
                  <Button 
                    variant="outline"
                    className={`w-full ${plano.isPremium ? 'border-amber-200 text-amber-700 hover:bg-amber-100' : ''}`}
                    onClick={() => window.open(plano.urlAnual, '_blank')}
                  >
                    {plano.anualPreco}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500">
            Dúvidas? Entre em contato conosco pelo e-mail: suporte@oficinaagil.com
          </p>
          <p className="text-xs text-gray-400">
            Após a assinatura, você terá acesso imediato a todas as funcionalidades do plano escolhido.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default PlanoExpirado;
