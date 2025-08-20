
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, ArrowRight, Check, Star, Users, Building, BarChart3 } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Oficina Go</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#funcionalidades" className="text-gray-600 hover:text-blue-600">Funcionalidades</a>
              <a href="#precos" className="text-gray-600 hover:text-blue-600">Preços</a>
              <a href="#contato" className="text-gray-600 hover:text-blue-600">Contato</a>
              <Link to="/login">
                <Button variant="outline">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button>Começar Grátis</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Sistema de Gestão para 
                <span className="text-blue-600 block">Oficinas Mecânicas</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Gerencie sua oficina de forma completa e profissional. Controle clientes, 
                orçamentos, ordens de serviço e financeiro em um só lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/register">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Começar Gratuitamente
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Já tenho conta
                  </Button>
                </Link>
              </div>
              <div className="text-sm text-gray-500">
                ✅ Teste grátis por 14 dias • ✅ Sem cartão de crédito • ✅ Cancele quando quiser
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-lg shadow-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1 bg-gray-100 rounded px-3 py-1 text-xs text-gray-500">
                    oficinago.com.br/dashboard
                  </div>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Dashboard Oficina Go" 
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tudo que sua oficina precisa
            </h2>
            <p className="text-xl text-gray-600">
              Sistema completo para gestão profissional da sua oficina
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gestão de Clientes</h3>
              <p className="text-gray-600">
                Cadastre e gerencie todos os seus clientes com histórico completo de serviços e veículos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Ordens de Serviço</h3>
              <p className="text-gray-600">
                Crie e gerencie ordens de serviço completas com status, peças e mão de obra.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Controle Financeiro</h3>
              <p className="text-gray-600">
                Tenha controle total das contas a pagar e receber com relatórios detalhados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preços */}
      <section id="precos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-xl text-gray-600">
              Escolha o plano ideal para sua oficina
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold mb-4">Essencial</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">R$ 29</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Até 100 clientes
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Ordens de serviço ilimitadas
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Controle financeiro básico
                </li>
              </ul>
              <Link to="/register">
                <Button className="w-full" variant="outline">
                  Começar Teste Grátis
                </Button>
              </Link>
            </div>

            <div className="bg-blue-600 rounded-lg p-8 text-white relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
                  Mais Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Premium</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">R$ 59</span>
                <span className="text-blue-200">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  Clientes ilimitados
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  IA para diagnósticos
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  Relatórios avançados
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  Suporte prioritário
                </li>
              </ul>
              <Link to="/register">
                <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                  Começar Teste Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes falam
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "O Oficina Go transformou completamente a gestão da nossa oficina. 
                Agora temos controle total de tudo!"
              </p>
              <div className="font-semibold">João Silva</div>
              <div className="text-sm text-gray-500">Auto Center Silva</div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Sistema muito fácil de usar. Em uma semana já dominamos todas as funcionalidades."
              </p>
              <div className="font-semibold">Maria Santos</div>
              <div className="text-sm text-gray-500">Oficina Santos</div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "O suporte é excelente e o sistema nunca me deixou na mão. Recomendo!"
              </p>
              <div className="font-semibold">Carlos Oliveira</div>
              <div className="text-sm text-gray-500">Mecânica Oliveira</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Entre em contato conosco
            </h2>
            <p className="text-xl text-blue-100">
              Estamos aqui para ajudar sua oficina a crescer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Telefone</h3>
              <p className="text-blue-100">(46) 99932-4779</p>
            </div>

            <div>
              <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p className="text-blue-100">contatooficinago@gmail.com</p>
            </div>

            <div>
              <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Localização</h3>
              <p className="text-blue-100">Pato Branco - PR, Brasil</p>
            </div>
          </div>

          <div className="text-center mt-16">
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">O</span>
                </div>
                <span className="text-xl font-bold">Oficina Go</span>
              </div>
              <p className="text-gray-400">
                Sistema completo de gestão para oficinas mecânicas.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#funcionalidades" className="hover:text-white">Funcionalidades</a></li>
                <li><a href="#precos" className="hover:text-white">Preços</a></li>
                <li><Link to="/register" className="hover:text-white">Teste Grátis</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#contato" className="hover:text-white">Contato</a></li>
                <li><Link to="/support" className="hover:text-white">Central de Ajuda</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-white">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Oficina Go. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
