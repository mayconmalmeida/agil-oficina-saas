
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 md:pt-36 md:pb-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="md:w-1/2 md:pr-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-oficina-dark mb-4">
              Sistema de orçamentos para <span className="text-oficina">oficinas mecânicas</span>
            </h1>
            <p className="text-lg md:text-xl text-oficina-gray mb-8">
              Simplifique a gestão da sua oficina, agilize orçamentos e aumente seus resultados com o OficinaÁgil.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-oficina-accent hover:bg-orange-600 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                <Link to="/registrar" className="flex items-center">
                  Teste Grátis por 7 Dias
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" className="border-oficina text-oficina hover:bg-oficina hover:text-white px-8 py-6 text-lg transition-colors">
                <a href="#planos">Ver Planos</a>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0 relative">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 animate-float">
              <img 
                src="https://placehold.co/800x500/2563EB/FFFFFF/png?text=Dashboard+OficinaÁgil" 
                alt="Dashboard do OficinaÁgil" 
                className="w-full h-auto" 
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-oficina-accent text-white rounded-lg py-3 px-4 shadow-lg transform rotate-3">
              <p className="text-sm font-bold">Simplifique seus orçamentos!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
