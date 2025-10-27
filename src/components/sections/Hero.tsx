
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Calendar, BarChart3, Wrench, Users, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Content */}
          <div className="text-center lg:text-left space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                Transforme sua oficina com 
                <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mt-2">
                  Oficina Go
                </span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Sistema completo de gestão para oficinas mecânicas com IA integrada, 
                agendamentos inteligentes e controle total do seu negócio.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" asChild>
                <Link to="/register" className="flex items-center">
                  Começar Agora Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-300" asChild>
                <Link to="/login" className="flex items-center">
                  Já tenho conta
                </Link>
              </Button>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6 pt-8">
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <Bot className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">IA Diagnóstico</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <Calendar className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Agendamentos</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Relatórios</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <Wrench className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Ordens Serviço</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <Users className="h-8 w-8 text-indigo-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Clientes</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <FileText className="h-8 w-8 text-red-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Orçamentos</span>
              </div>
            </div>

            <div className="text-center lg:text-left pt-4">
              <p className="text-gray-500 text-sm">
                ✨ <strong>Teste grátis por 7 dias ou até 10 clientes</strong> • Sem cartão de crédito • Cancele quando quiser
              </p>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative mt-8 lg:mt-0">
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-3xl transform rotate-6 scale-105 opacity-20 animate-pulse"></div>
              <div className="relative bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-200">
                {/* Browser mockup */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1 bg-gray-100 rounded px-3 py-1 text-xs text-gray-500">
                      oficinago.com.br/dashboard
                    </div>
                  </div>
                  
                  {/* Dashboard content */}
                  <div className="space-y-3">
                    <div className="h-6 bg-blue-100 rounded w-2/3"></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-blue-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats section */}
        <div className="mt-16 sm:mt-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">500+</div>
              <p className="text-gray-600">Oficinas Ativas</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">50mil+</div>
              <p className="text-gray-600">Ordens de Serviço</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">98%</div>
              <p className="text-gray-600">Satisfação</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>
    </section>
  );
}
