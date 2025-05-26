
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NotFound = () => {
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Show a toast notification to help users
    toast({
      title: "Página não encontrada",
      description: `A rota ${location.pathname} não existe. Redirecionando você para uma página válida.`,
      variant: "destructive",
    });
  }, [location.pathname, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Página não encontrada</p>
        <p className="text-gray-500 mb-8">
          A página que você está procurando não existe ou foi movida.
          Use os botões abaixo para navegar para uma página válida.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="default" className="flex items-center gap-2" asChild>
            <Link to="/">
              <Home size={18} />
              Página Inicial
            </Link>
          </Button>
          <Button variant="default" className="flex items-center gap-2" asChild>
            <Link to="/login">
              <LogIn size={18} />
              Fazer Login
            </Link>
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => window.history.back()}>
            <ArrowLeft size={18} />
            Voltar
          </Button>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Principais rotas disponíveis:</strong>
          </p>
          <div className="mt-2 text-xs text-blue-600 grid grid-cols-2 gap-1">
            <Link to="/" className="hover:underline">• Início</Link>
            <Link to="/login" className="hover:underline">• Login</Link>
            <Link to="/registrar" className="hover:underline">• Cadastro</Link>
            <Link to="/dashboard" className="hover:underline">• Dashboard</Link>
            <Link to="/clientes" className="hover:underline">• Clientes</Link>
            <Link to="/orcamentos" className="hover:underline">• Orçamentos</Link>
            <Link to="/servicos" className="hover:underline">• Serviços</Link>
            <Link to="/agendamentos" className="hover:underline">• Agendamentos</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
