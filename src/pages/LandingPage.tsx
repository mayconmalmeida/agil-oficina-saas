
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Calendar, BarChart3, Users, Settings, Shield, Clock, Smartphone, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Oficina Go</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#funcionalidades" className="text-gray-600 hover:text-blue-600">Funcionalidades</a>
            <a href="#planos" className="text-gray-600 hover:text-blue-600">Planos</a>
            <a href="#faq" className="text-gray-600 hover:text-blue-600">FAQ</a>
            <a href="#contato" className="text-gray-600 hover:text-blue-600">Contato</a>
          </nav>
          <div className="flex space-x-3">
            <Button variant="outline" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Teste Grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Transforme sua oficina com{' '}
                <span className="text-blue-600">Oficina Go</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Sistema completo de gestão para oficinas mecânicas com IA integrada, 
                relatórios avançados e controle total do seu negócio.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="px-8 py-3 text-lg" asChild>
                  <Link to="/register">Começar Agora →</Link>
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-3 text-lg" asChild>
                  <Link to="/login">Fazer Login</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="flex space-x-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-blue-100 rounded-lg p-4 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="bg-green-100 rounded-lg p-4 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Icons */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">IA Diagnóstico</h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Agendamentos</h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Relatórios</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades que Transformam */}
      <section id="funcionalidades" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades que <span className="text-blue-600">Transformam</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra como o Oficina Go pode revolucionar a gestão da sua oficina com tecnologia de ponta
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">IA para Diagnóstico</h3>
                <p className="text-gray-600 text-sm">
                  Inteligência artificial avançada para identificar problemas mecânicos rapidamente
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Agendamentos Inteligentes</h3>
                <p className="text-gray-600 text-sm">
                  Sistema completo de agendamento com notificações automáticas
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Relatórios Avançados</h3>
                <p className="text-gray-600 text-sm">
                  Dashboard completo com métricas importantes do seu negócio
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Gestão de Clientes</h3>
                <p className="text-gray-600 text-sm">
                  Cadastro completo de clientes com histórico de serviços
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-red-600" />
              </div>
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Controle de Serviços</h3>
                <p className="text-gray-600 text-sm">
                  Gerencie todos os serviços e peças da sua oficina
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Orçamentos Digitais</h3>
                <p className="text-gray-600 text-sm">
                  Crie orçamentos profissionais em poucos cliques
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Backup Automático</h3>
                <p className="text-gray-600 text-sm">
                  Seus dados sempre seguros na nuvem
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-pink-600" />
              </div>
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Acesso Mobile</h3>
                <p className="text-gray-600 text-sm">
                  Acesse de qualquer lugar pelo celular ou tablet
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* IA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            ⚡ Potencialize Sua Oficina com Inteligência Artificial!
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Conheça as ferramentas de IA que vão revolucionar sua gestão e atendimento.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur border-white/20 p-8">
              <div className="flex items-center mb-4">
                <Settings className="h-8 w-8 text-white mr-3" />
                <h3 className="text-xl font-bold text-white">IA para Diagnóstico de Problemas Mecânicos</h3>
              </div>
              <div className="bg-blue-900/30 rounded px-3 py-1 text-sm mb-4 inline-block">
                Exclusivo Plano PREMIUM
              </div>
              <p className="text-white/90 mb-6">
                Digite os sintomas que o cliente relata e deixe nossa IA analisar e 
                sugerir possíveis causas, economizando tempo e aumentando a 
                precisão dos seus diagnósticos.
              </p>
              <ul className="text-left space-y-2 text-white/90 mb-6">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-400" />
                  Análise de sintomas em tempo real
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-400" />
                  Sugestão de causas prováveis baseada em IA
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-400" />
                  Base de dados inteligente de falhas veiculares
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-400" />
                  Aumenta precisão e reduz tempo de diagnóstico
                </li>
              </ul>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                Comece o Plano Premium
              </Button>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20 p-8">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-white mr-3" />
                <h3 className="text-xl font-bold text-white">IA para Suporte Inteligente no Sistema</h3>
              </div>
              <div className="bg-green-900/30 rounded px-3 py-1 text-sm mb-4 inline-block">
                Disponível no Plano ESSENCIAL
              </div>
              <p className="text-white/90 mb-6">
                Tenha um assistente virtual sempre disponível para tirar suas 
                dúvidas sobre o uso da plataforma. Respostas rápidas e precisas a 
                um clique!
              </p>
              <ul className="text-left space-y-2 text-white/90 mb-6">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-400" />
                  Chat embutido no sistema
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-400" />
                  Respostas baseadas no manual do sistema
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-400" />
                  Disponível 24 horas por dia, 7 dias por semana
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-400" />
                  Reduz tempo de suporte e melhora experiência
                </li>
              </ul>
              <Button className="bg-green-600 hover:bg-green-700 text-white w-full">
                Comece Agora (Plano Essencial)
              </Button>
            </Card>
          </div>

          <div className="mt-12 bg-white/10 backdrop-blur rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-6">Transforme sua oficina com tecnologia de ponta</h3>
            <p className="text-lg mb-8 opacity-90">
              Seja um dos primeiros a experimentar o futuro da gestão automotiva. Nossas IAs foram 
              desenvolvidas especificamente para o setor automotivo.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Experimentar Gratuitamente
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Números que comprovam nossa eficiência
            </h2>
            <p className="text-gray-600">
              O OficinaÁgil está ajudando centenas de profissionais a transformar a gestão das suas oficinas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">+100</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Oficinas Ativas</div>
              <p className="text-gray-600">
                Oficinas em todo o Brasil usando o OficinaÁgil diariamente.
              </p>
            </div>

            <div>
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">+300</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Usuários Cadastrados</div>
              <p className="text-gray-600">
                Donos de funcionários trabalhando com mais eficiência e menos burocracia.
              </p>
            </div>

            <div>
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">+5000</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Orçamentos Criados</div>
              <p className="text-gray-600">
                Orçamentos profissionais que aumentam a taxa de aprovação dos clientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Como Funciona</h2>
            <p className="text-xl text-gray-600">
              Começar a usar o OficinaÁgil é simples e rápido. Siga estes passos:
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Comece com teste grátis</h3>
              <p className="text-gray-600 text-sm mb-4">
                Experimente todas as funcionalidades do sistema por 7 dias sem compromisso.
              </p>
              <div className="text-blue-600 text-sm">→</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cadastre seus dados</h3>
              <p className="text-gray-600 text-sm mb-4">
                Configure sua oficina, usuários, produtos e clientes para começar a operar.
              </p>
              <div className="text-blue-600 text-sm">→</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Crie orçamentos</h3>
              <p className="text-gray-600 text-sm mb-4">
                Elabore orçamentos detalhados de forma rápida e profissional.
              </p>
              <div className="text-blue-600 text-sm">→</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aumente seus resultados</h3>
              <p className="text-gray-600 text-sm">
                Gerencie melhor seu negócio e veja seus resultados crescerem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planos que Cabem no seu Bolso
            </h2>
            <p className="text-xl text-gray-600">
              Escolha o plano ideal para sua oficina. Comece grátis e evolua conforme seu negócio cresce.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plano Mensal */}
            <Card className="relative p-8 border-2 hover:border-blue-200 transition-colors">
              <CardContent className="p-0">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Plano Mensal</h3>
                  <div className="text-5xl font-bold text-blue-600 mb-2">R$ 197</div>
                  <p className="text-gray-600">por mês</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Todas as funcionalidades</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>IA para diagnóstico</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Suporte técnico</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Atualizações automáticas</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Backup na nuvem</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Relatórios avançados</span>
                  </li>
                </ul>

                <Button className="w-full" size="lg" asChild>
                  <Link to="/register">Começar Teste Grátis</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Plano Anual */}
            <Card className="relative p-8 border-2 border-blue-500 bg-blue-50 hover:border-blue-600 transition-colors">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Mais Popular
                </span>
              </div>
              <CardContent className="p-0">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Plano Anual</h3>
                  <div className="text-5xl font-bold text-blue-600 mb-2">R$ 1.970</div>
                  <p className="text-gray-600">por ano</p>
                  <div className="text-green-600 font-medium mt-2">
                    Economize 2 meses!
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Todas as funcionalidades</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>IA para diagnóstico</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Suporte técnico prioritário</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Atualizações automáticas</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Backup na nuvem</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Relatórios avançados</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="font-medium">2 meses grátis</span>
                  </li>
                </ul>

                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg" asChild>
                  <Link to="/register">Começar Teste Grátis</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              ✅ 7 dias de teste grátis • ✅ Sem cartão de crédito • ✅ Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
            <p className="text-xl text-gray-600">
              Encontre respostas para as dúvidas mais comuns sobre o OficinaÁgil.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Como funciona o período de teste grátis?",
                answer: "Você tem 7 dias para testar todas as funcionalidades sem limitações. Não é necessário cartão de crédito para começar."
              },
              {
                question: "Preciso instalar algum software no meu computador?",
                answer: "Não! O OficinaÁgil funciona 100% online. Basta acessar pelo navegador de qualquer dispositivo."
              },
              {
                question: "Quantos usuários posso cadastrar?",
                answer: "Você pode cadastrar quantos colaboradores precisar. Cada um terá seu próprio acesso e permissões."
              },
              {
                question: "Meus dados estão seguros?",
                answer: "Sim! Utilizamos criptografia de dados e backup automático na nuvem para garantir total segurança."
              },
              {
                question: "Como funciona o suporte técnico?",
                answer: "Oferecemos suporte via chat, email e WhatsApp durante horário comercial. Planos anuais têm suporte prioritário."
              },
              {
                question: "Posso exportar meus dados para outros sistemas?",
                answer: "Sim! Você pode exportar seus dados a qualquer momento em formatos padrão como Excel e PDF."
              },
              {
                question: "Como é feito o pagamento?",
                answer: "Aceitamos cartão de crédito, PIX e boleto bancário. O pagamento é processado de forma segura."
              }
            ].map((faq, index) => (
              <Card key={index} className="p-6">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                    <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-4 text-gray-600 leading-relaxed">{faq.answer}</p>
                </details>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Ainda tem dúvidas? Entre em contato conosco!</p>
            <Button variant="outline" asChild>
              <a href="https://wa.me/5546999324779" target="_blank" rel="noopener noreferrer">
                Fale Conosco
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600/20 rounded-full px-6 py-2 inline-block mb-6">
            <span className="text-blue-200">Experimente por 7 dias grátis!</span>
          </div>
          <h2 className="text-4xl font-bold mb-6">
            Transforme a gestão da sua oficina com o OficinaÁgil
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a centenas de oficinas que já estão economizando tempo, 
            reduzindo erros e aumentando seus resultados.
          </p>
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3" asChild>
            <Link to="/register">Começar Agora →</Link>
          </Button>
          <p className="mt-4 text-sm opacity-75">
            Sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-blue-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Entre em Contato</h3>
              <p className="mb-8 opacity-90">
                Estamos aqui para ajudar você a transformar a gestão da sua oficina. 
                Preencha o formulário e nossa equipe entrará em contato o mais rápido possível.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">E-mail</h4>
                  <p className="opacity-90">contatooficinage@gmail.com</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Telefone</h4>
                  <p className="opacity-90">(46) 99932-4779</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Horário de Atendimento</h4>
                  <p className="opacity-90">Seg - Sex: 8h às 18h</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                <input
                  type="tel"
                  placeholder="(XX) XXXXX-XXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem</label>
                <textarea
                  rows={4}
                  placeholder="Como podemos ajudar você?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                Enviar Mensagem
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">O</span>
                </div>
                <span className="text-xl font-bold">Oficina Go</span>
              </div>
              <p className="text-gray-400 mb-4">
                Sistema completo de gestão para oficinas automotivas
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <div className="space-y-2 text-gray-400">
                <p>📞 (46) 99932-4779</p>
                <p>✉️ contatooficinage@gmail.com</p>
                <p>📍 Pato Branco - PR, Brasil</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Localização</h4>
              <div className="text-gray-400">
                <p>Pato Branco - PR</p>
                <p>Brasil</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 Oficina Go. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
