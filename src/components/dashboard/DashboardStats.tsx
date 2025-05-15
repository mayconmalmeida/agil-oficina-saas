
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Package, FileText } from "lucide-react";

type DashboardStatsProps = {
  totalClients: number;
  totalServices: number;
  totalBudgets: number;
  isLoading?: boolean;
}

const DashboardStats = ({ 
  totalClients, 
  totalServices, 
  totalBudgets, 
  isLoading = false 
}: DashboardStatsProps) => {
  const stats = [
    {
      title: "Clientes",
      value: totalClients,
      icon: Users,
      description: "clientes cadastrados",
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "Produtos/Serviços",
      value: totalServices,
      icon: Package,
      description: "itens disponíveis",
      color: "bg-green-100 text-green-700"
    },
    {
      title: "Orçamentos",
      value: totalBudgets,
      icon: FileText,
      description: "orçamentos criados",
      color: "bg-amber-100 text-amber-700"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className="text-3xl font-bold">{stat.value}</h3>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
