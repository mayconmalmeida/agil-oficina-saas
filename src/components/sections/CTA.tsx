
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from 'lucide-react';
import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="py-20 bg-oficina">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/20 rounded-full px-4 py-2 mb-8">
            <Zap className="h-5 w-5 text-white mr-2" />
            <span className="text-white font-medium">Experimente por 7 dias grátis!</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Transforme a Gestão da Sua Oficina com o OficinaÁgil
          </h2>
          
          <p className="text-xl text-white/90 mb-8">
            Junte-se a centenas de oficinas que já estão economizando tempo, 
            reduzindo erros e aumentando seus resultados.
          </p>
          
          <Button className="bg-white text-oficina hover:bg-gray-100 px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
            <Link to="/registrar" className="flex items-center">
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          
          <p className="text-white/80 mt-6">
            Sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>
      </div>
    </section>
  );
}
