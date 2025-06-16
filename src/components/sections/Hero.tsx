
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, BarChart3 } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <div className="relative bg-oficina pt-16 sm:pt-20 pb-12 sm:pb-16 lg:pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-oficina to-oficina/80"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          <div className="text-left space-y-4 sm:space-y-6 animate-slide-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-poppins tracking-tight text-white">
              <span className="block">Software de gestão</span>
              <span className="block text-oficina-accent mt-2">para sua oficina</span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-xl">
              O OficinaÁgil é o sistema completo que sua oficina precisa para 
              gerenciar clientes, orçamentos e serviços com facilidade. 
              Menos burocracia, mais resultados.
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2">
              <Button 
                asChild
                size="lg"
                className="bg-oficina-accent text-oficina hover:bg-oficina-accent/90 font-medium shadow-accent w-full sm:w-auto"
              >
                <Link to="/workshop-registration" className="flex items-center justify-center">
                  Começar agora
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              
              <Button 
                asChild
                variant="outline"
                size="lg"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 w-full sm:w-auto"
              >
                <a href="#funcionalidades" className="flex items-center justify-center">
                  Ver funcionalidades
                </a>
              </Button>
            </div>
            
            <div className="text-white/80 text-xs sm:text-sm pt-2">
              <span className="italic">Experimente grátis por 7 dias, sem compromisso.</span>
            </div>
          </div>
          
          <div className="relative lg:mt-0 mt-6 sm:mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 shadow-xl overflow-hidden">
              <div className="p-1">
                <div className="bg-oficina/80 rounded-md p-2">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                
                <AspectRatio ratio={16/9} className="mt-1">
                  <img
                    src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80"
                    alt="Oficina mecânica moderna com ferramentas organizadas"
                    className="object-cover w-full h-full rounded-md"
                  />
                </AspectRatio>
              </div>
            </div>
            
            {/* Cards flutuantes decorativos - apenas em telas maiores */}
            <div className="absolute -bottom-4 sm:-bottom-6 -left-6 sm:-left-10 bg-white rounded-lg p-2 sm:p-3 shadow-xl animate-float transform rotate-6 hidden md:block">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="bg-green-100 p-1 sm:p-2 rounded-full">
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                </div>
                <div className="text-xs font-medium">+28% novos clientes</div>
              </div>
            </div>
            
            <div className="absolute top-6 sm:top-10 -right-4 sm:-right-6 bg-white rounded-lg p-2 sm:p-3 shadow-xl animate-float transform -rotate-3 hidden md:block" style={{ animationDelay: '2s' }}>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="bg-blue-100 p-1 sm:p-2 rounded-full">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <div className="text-xs font-medium">Economize 12h/semana</div>
              </div>
            </div>
            
            <div className="absolute top-1/2 -right-8 sm:-right-12 bg-white rounded-lg p-2 sm:p-3 shadow-xl animate-float transform rotate-3 hidden md:block" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="bg-purple-100 p-1 sm:p-2 rounded-full">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                </div>
                <div className="text-xs font-medium">Dados seguros</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative mt-12 sm:mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">+3500</div>
            <p className="text-white/80 text-sm sm:text-base">Orçamentos criados</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">+100</div>
            <p className="text-white/80 text-sm sm:text-base">Oficinas ativas</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">95%</div>
            <p className="text-white/80 text-sm sm:text-base">Satisfação dos clientes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
