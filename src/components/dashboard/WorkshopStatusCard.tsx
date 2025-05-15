
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

type WorkshopStatus = 'active' | 'trial' | 'expired';

type WorkshopStatusCardProps = {
  status: WorkshopStatus;
  daysRemaining?: number;
  isLoading?: boolean;
};

const WorkshopStatusCard = ({ status, daysRemaining = 0, isLoading = false }: WorkshopStatusCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusDisplay = () => {
    switch (status) {
      case 'active':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          title: "Oficina Ativa",
          description: "Sua oficina está operando com o plano completo.",
          className: "bg-green-50 border-green-200"
        };
      case 'trial':
        return {
          icon: <Info className="h-6 w-6 text-blue-500" />,
          title: "Período de Teste",
          description: `Restam ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'} de teste.`,
          className: "bg-blue-50 border-blue-200"
        };
      case 'expired':
        return {
          icon: <AlertCircle className="h-6 w-6 text-red-500" />,
          title: "Assinatura Expirada",
          description: "Sua assinatura de teste expirou. Atualize para continuar.",
          className: "bg-red-50 border-red-200"
        };
      default:
        return {
          icon: <Info className="h-6 w-6 text-gray-500" />,
          title: "Status Desconhecido",
          description: "Não foi possível determinar o status da oficina.",
          className: "bg-gray-50 border-gray-200"
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status da Oficina</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`p-4 rounded-md border ${statusDisplay.className} flex items-center gap-4`}>
          {statusDisplay.icon}
          <div>
            <h4 className="font-medium">{statusDisplay.title}</h4>
            <p className="text-sm text-muted-foreground">{statusDisplay.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkshopStatusCard;
