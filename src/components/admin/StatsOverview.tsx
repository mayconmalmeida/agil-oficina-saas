
import React from 'react';
import StatsCard from './StatsCard';
import { Users, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { AdminStats } from '@/hooks/admin/useAdminData';

type StatsOverviewProps = {
  stats: AdminStats;
};

const StatsOverview = ({ stats }: StatsOverviewProps) => {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Visão Geral</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Oficinas Ativas"
          value={stats.totalUsers}
          description="Oficinas com status ativo"
          icon={Users}
        />
        <StatsCard
          title="Assinaturas Ativas"
          value={stats.activeSubscriptions}
          description="Assinaturas pagas ativas"
          icon={CheckCircle}
        />
        <StatsCard
          title="Usuários em Teste"
          value={stats.trialingUsers}
          description="Usuários em período de teste"
          icon={AlertCircle}
        />
        <StatsCard
          title="Novos Usuários (Mês)"
          value={stats.newUsersThisMonth}
          description="Cadastros neste mês"
          icon={FileText}
        />
      </div>
    </section>
  );
};

export default StatsOverview;
