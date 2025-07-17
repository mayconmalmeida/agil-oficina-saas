
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Calendar, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Content */}
          <div className="text-center lg:text-left space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                Transforme sua oficina com 
                <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Oficina Go
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Sistema completo de gestão para oficinas mecânicas com IA integrada, 
                relatórios avançados e controle total do seu negócio.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                <Link to="/workshop-registration" className="flex items-center">
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-300">
                Ver Demonstração
              </Button>
            </div>

            {/* Features highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 pt-6 lg:pt-8">
              <div className="flex items-center justify-center lg:justify-start space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <Bot className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">IA Diagnóstico</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <Calendar className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Agendamentos</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Relatórios</span>
              </div>
            </div>
          </div>

          {/* Image/Visual */}
          <div className="relative mt-8 lg:mt-0">
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-3xl transform rotate-6 scale-105 opacity-20"></div>
              <div className="relative bg-white p-6 sm:p-8 rounded-3xl shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-blue-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <Bot className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>
    </section>
  );
}
