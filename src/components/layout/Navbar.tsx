
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <a href="#" className="flex items-center">
            <span className="text-2xl font-bold text-oficina-dark">Oficina<span className="text-oficina-accent">Ágil</span></span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#funcionalidades" className="text-oficina-gray hover:text-oficina-dark transition-colors">Funcionalidades</a>
          <a href="#planos" className="text-oficina-gray hover:text-oficina-dark transition-colors">Planos</a>
          <a href="#faq" className="text-oficina-gray hover:text-oficina-dark transition-colors">FAQ</a>
          <a href="#contato" className="text-oficina-gray hover:text-oficina-dark transition-colors">Contato</a>
          <Button className="bg-oficina hover:bg-oficina-dark transition-colors shadow-blue">
            <a href="#teste-gratis">Teste Grátis</a>
          </Button>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-oficina-dark focus:outline-none"
          >
            {isMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-lg">
          <nav className="flex flex-col space-y-4">
            <a
              href="#funcionalidades"
              className="text-oficina-gray hover:text-oficina-dark transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Funcionalidades
            </a>
            <a
              href="#planos"
              className="text-oficina-gray hover:text-oficina-dark transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Planos
            </a>
            <a
              href="#faq"
              className="text-oficina-gray hover:text-oficina-dark transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </a>
            <a
              href="#contato"
              className="text-oficina-gray hover:text-oficina-dark transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contato
            </a>
            <Button className="bg-oficina hover:bg-oficina-dark transition-colors w-full">
              <a href="#teste-gratis">Teste Grátis</a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
