
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
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">A</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                AutoFlow
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          <a href="#funcionalidades" className="text-gray-600 hover:text-blue-800 transition-colors text-sm xl:text-base font-medium">
            Funcionalidades
          </a>
          <a href="#precos" className="text-gray-600 hover:text-blue-800 transition-colors text-sm xl:text-base font-medium">
            Planos
          </a>
          <a href="#faq" className="text-gray-600 hover:text-blue-800 transition-colors text-sm xl:text-base font-medium">
            FAQ
          </a>
          <a href="#contato" className="text-gray-600 hover:text-blue-800 transition-colors text-sm xl:text-base font-medium">
            Contato
          </a>
          <div className="flex space-x-2 xl:space-x-3">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-lg text-xs xl:text-sm px-4 xl:px-6">
              <Link to="/workshop-registration">Teste Grátis</Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors text-xs xl:text-sm px-4 xl:px-6" 
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
            className="text-blue-800 focus:outline-none p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t shadow-lg">
          <nav className="flex flex-col px-4 py-4 space-y-4">
            <a 
              href="#funcionalidades" 
              className="text-gray-600 hover:text-blue-800 transition-colors py-3 text-base font-medium border-b border-gray-100" 
              onClick={() => setIsMenuOpen(false)}
            >
              Funcionalidades
            </a>
            <a 
              href="#precos" 
              className="text-gray-600 hover:text-blue-800 transition-colors py-3 text-base font-medium border-b border-gray-100" 
              onClick={() => setIsMenuOpen(false)}
            >
              Planos
            </a>
            <a 
              href="#faq" 
              className="text-gray-600 hover:text-blue-800 transition-colors py-3 text-base font-medium border-b border-gray-100" 
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </a>
            <a 
              href="#contato" 
              className="text-gray-600 hover:text-blue-800 transition-colors py-3 text-base font-medium border-b border-gray-100" 
              onClick={() => setIsMenuOpen(false)}
            >
              Contato
            </a>
            <div className="pt-4 space-y-3">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-colors w-full py-3 text-base font-medium">
                <Link to="/workshop-registration">Teste Grátis</Link>
              </Button>
              <Button 
                variant="outline" 
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors w-full py-3 text-base font-medium" 
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/login');
                }}
              >
                <div className="flex items-center justify-center">
                  <LogIn className="mr-2 h-5 w-5" />
                  Login
                </div>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
