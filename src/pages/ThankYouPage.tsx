
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ThankYouPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-oficina-dark">
            Obrigado por confirmar seu e-mail!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="rounded-full bg-green-100 w-20 h-20 flex items-center justify-center mx-auto">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-10 w-10 text-green-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          
          <p className="text-gray-600">
            Seu cadastro foi concluído com sucesso.
          </p>
          
          <Button asChild className="w-full bg-oficina hover:bg-oficina-dark">
            <Link to="/login">
              Fazer login no site
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThankYouPage;
