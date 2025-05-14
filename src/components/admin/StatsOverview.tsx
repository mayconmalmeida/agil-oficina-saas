
import React from 'react';
import StatsCard from './StatsCard';
import { Users, FileText, CheckCircle, AlertCircle } from "lucide-react";

type UserStats = {
  totalUsers: number;
  totalQuotes: number;
  activeUsers: number;
  activeSubscriptions: number;
};

type StatsOverviewProps = {
  stats: UserStats;
};

const StatsOverview = ({ stats }: StatsOverviewProps) => {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-medium mb-4">Visão Geral</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Usuários Totais"
          value={stats.totalUsers}
          description="Oficinas cadastradas no sistema"
          icon={Users}
        />
        <StatsCard
          title="Orçamentos"
          value={stats.totalQuotes}
          description="Total de orçamentos gerados"
          icon={FileText}
        />
        <StatsCard
          title="Usuários Ativos"
          value={stats.activeUsers}
          description="Ativos nos últimos 30 dias"
          icon={CheckCircle}
        />
        <StatsCard
          title="Assinaturas Ativas"
          value={stats.activeSubscriptions}
          description="Assinaturas pagas ativas"
          icon={AlertCircle}
        />
      </div>
    </section>
  );
};

export default StatsOverview;
