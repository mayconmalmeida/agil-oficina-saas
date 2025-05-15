
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import WorkshopRegistrationForm from '@/components/registration/WorkshopRegistrationForm';

const WorkshopRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('Essencial');
  
  // Get the selected plan from query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const plan = queryParams.get('plano');
    
    if (plan && ['Essencial', 'Premium'].includes(plan)) {
      setSelectedPlan(plan);
    }
  }, [location.search]);
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          toast({
            title: "Você já está logado",
            description: "Você será redirecionado para o painel."
          });
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="flex justify-center mb-8">
          <a href="/" className="text-2xl font-bold text-oficina-dark">
            Oficina<span className="text-oficina-accent">Ágil</span>
          </a>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Cadastro da Oficina</CardTitle>
            <CardDescription className="text-center">
              Preencha os dados abaixo para criar sua conta
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!['Essencial', 'Premium'].includes(selectedPlan) && (
              <Alert className="mb-6" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Plano não selecionado</AlertTitle>
                <AlertDescription>
                  Por favor, selecione um plano antes de continuar com o cadastro.
                  <div className="mt-2">
                    <a 
                      href="/" 
                      className="text-white underline hover:text-gray-100"
                    >
                      Voltar para seleção de planos
                    </a>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <WorkshopRegistrationForm selectedPlan={selectedPlan} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkshopRegistrationPage;
