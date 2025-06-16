
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-2 sm:py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img 
              alt="OficinaGO" 
              src="/lovable-uploads/0e839f4d-0752-4628-84f5-9f410ef13996.png" 
              className="h-12 w-auto sm:h-16 md:h-20 object-contain max-w-[150px] sm:max-w-[180px] md:max-w-[200px]" 
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          <a href="#funcionalidades" className="text-oficina-gray hover:text-oficina-dark transition-colors text-sm xl:text-base">
            Funcionalidades
          </a>
          <a href="#precos" className="text-oficina-gray hover:text-oficina-dark transition-colors text-sm xl:text-base">
            Planos
          </a>
          <a href="#faq" className="text-oficina-gray hover:text-oficina-dark transition-colors text-sm xl:text-base">
            FAQ
          </a>
          <a href="#contato" className="text-oficina-gray hover:text-oficina-dark transition-colors text-sm xl:text-base">
            Contato
          </a>
          <div className="flex space-x-2 xl:space-x-3">
            <Button size="sm" className="bg-oficina hover:bg-oficina-dark transition-colors shadow-blue text-xs xl:text-sm px-3 xl:px-4">
              <Link to="/workshop-registration">Teste Grátis</Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-oficina text-oficina hover:bg-oficina hover:text-white transition-colors text-xs xl:text-sm px-3 xl:px-4" 
              onClick={handleLoginClick}
            >
              <div className="flex items-center">
                <LogIn className="mr-1 xl:mr-2 h-3 w-3 xl:h-4 xl:w-4" />
                Login
              </div>
            </Button>
          </div>
        </nav>

        {/* Mobile menu button */}
        <div className="lg:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="text-oficina-dark focus:outline-none p-2"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white py-4 px-4 shadow-lg border-t">
          <nav className="flex flex-col space-y-4">
            <a 
              href="#funcionalidades" 
              className="text-oficina-gray hover:text-oficina-dark transition-colors py-2 text-base" 
              onClick={() => setIsMenuOpen(false)}
            >
              Funcionalidades
            </a>
            <a 
              href="#precos" 
              className="text-oficina-gray hover:text-oficina-dark transition-colors py-2 text-base" 
              onClick={() => setIsMenuOpen(false)}
            >
              Planos
            </a>
            <a 
              href="#faq" 
              className="text-oficina-gray hover:text-oficina-dark transition-colors py-2 text-base" 
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </a>
            <a 
              href="#contato" 
              className="text-oficina-gray hover:text-oficina-dark transition-colors py-2 text-base" 
              onClick={() => setIsMenuOpen(false)}
            >
              Contato
            </a>
            <Button className="bg-oficina hover:bg-oficina-dark transition-colors w-full mt-4">
              <Link to="/workshop-registration">Teste Grátis</Link>
            </Button>
            <Button 
              variant="outline" 
              className="border-oficina text-oficina hover:bg-oficina hover:text-white transition-colors w-full" 
              onClick={() => {
                setIsMenuOpen(false);
                navigate('/login');
              }}
            >
              <div className="flex items-center justify-center">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </div>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
