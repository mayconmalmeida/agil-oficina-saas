
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from 'lucide-react';
import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-oficina to-oficina-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
            <Zap className="h-5 w-5 text-oficina-accent mr-2" />
            <span className="text-white font-medium">Experimente por 7 dias grátis!</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-poppins text-white mb-8">
            Transforme a gestão da sua oficina<br className="hidden md:block" /> com o OficinaÁgil
          </h2>
          
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Junte-se a centenas de oficinas que já estão economizando tempo, 
            reduzindo erros e aumentando seus resultados.
          </p>
          
          <Button 
            asChild
            size="lg"
            className="bg-oficina-accent text-oficina hover:bg-oficina-accent/90 font-medium shadow-accent px-10 py-7 text-lg"
          >
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
