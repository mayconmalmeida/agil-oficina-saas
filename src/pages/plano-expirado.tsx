
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PlanoExpirado = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
    <Card className="w-full max-w-lg">
      <CardContent className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Seu período de teste acabou!
        </h1>
        <p className="mb-6 text-gray-600">
          Para continuar usando o Oficina Ágil, escolha um plano abaixo:
        </p>
        <a href="/planos">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            Ver Planos e Assinar
          </Button>
        </a>
      </CardContent>
    </Card>
  </div>
);

export default PlanoExpirado;
