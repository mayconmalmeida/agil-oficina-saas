
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Página não encontrada</p>
        <p className="text-gray-500 mb-8">
          A página que você está procurando não existe ou foi movida.
          Por favor, verifique o endereço ou retorne para a página inicial.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="default" className="flex items-center gap-2" asChild>
            <Link to="/">
              <Home size={18} />
              Página Inicial
            </Link>
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => window.history.back()}>
            <ArrowLeft size={18} />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
