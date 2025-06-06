
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageCircle, Sparkles } from 'lucide-react';

const AIFeatures: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h2 className="text-4xl font-extrabold text-gray-900">
              Potencialize Sua Oficina com Inteligência Artificial!
            </h2>
          </div>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Conheça as ferramentas de IA que vão revolucionar sua gestão e atendimento.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Card para IA de Diagnóstico (PREMIUM) */}
          <Card className="bg-white shadow-lg border-t-4 border-blue-600 hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Brain className="h-8 w-8 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    IA para Diagnóstico de Problemas Mecânicos
                  </CardTitle>
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    Exclusivo Plano PREMIUM
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-gray-700 text-base">
                Digite os sintomas que o cliente relata e deixe nossa IA analisar e sugerir possíveis causas,
                economizando tempo e aumentando a precisão dos seus diagnósticos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span>Análise de sintomas em tempo real</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span>Sugestão de causas prováveis baseada em IA</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span>Base de dados inteligente de falhas veiculares</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span>Aumenta precisão e reduz tempo de diagnóstico</span>
                </li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3">
                Conheça o Plano Premium
              </Button>
            </CardContent>
          </Card>

          {/* Card para IA de Suporte (ESSENCIAL) */}
          <Card className="bg-white shadow-lg border-t-4 border-green-600 hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle className="h-8 w-8 text-green-600" />
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    IA para Suporte Inteligente no Sistema
                  </CardTitle>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Disponível no Plano ESSENCIAL
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-gray-700 text-base">
                Tenha um assistente virtual sempre disponível para tirar suas dúvidas sobre o uso da plataforma.
                Respostas rápidas e precisas a um clique!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Chat embutido no sistema</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Respostas baseadas no manual do sistema</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Disponível 24 horas por dia, 7 dias por semana</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Reduz tempo de suporte e melhora experiência</span>
                </li>
              </ul>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3">
                Comece Agora (Plano Essencial)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CTA adicional */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Transforme sua oficina com tecnologia de ponta
            </h3>
            <p className="text-gray-700 mb-6 text-lg">
              Seja um dos primeiros a experimentar o futuro da gestão automotiva. 
              Nossas IAs foram desenvolvidas especificamente para o setor automotivo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                Experimentar Gratuitamente
              </Button>
              <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIFeatures;
