
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DashboardData } from '@/types/dashboardTypes';
import { useDashboardCounts } from '@/hooks/dashboard/useDashboardCounts';
import { useRecentActivities } from '@/hooks/dashboard/useRecentActivities';
import { useWorkshopStatus } from '@/hooks/dashboard/useWorkshopStatus';
import { useChartData } from '@/hooks/dashboard/useChartData';

export type { WorkshopStatus, DashboardData } from '@/types/dashboardTypes';

export const useDashboardData = (userId?: string) => {
  const { counts, isLoading: countsLoading } = useDashboardCounts();
  const { activities, isLoading: activitiesLoading } = useRecentActivities();
  const { status, isLoading: statusLoading } = useWorkshopStatus(userId);
  const { chartData, isLoading: chartLoading } = useChartData();
  
  // Calculate if all data is loading
  const isLoading = countsLoading || activitiesLoading || statusLoading || chartLoading;

  // Memoize the dashboard data to prevent unnecessary recalculations
  const data = useMemo<DashboardData>(() => {
    // Convert chart data to expected format
    const monthlyRevenue = chartData.map(item => ({
      month: item.name,
      value: item.value
    }));

    return {
      totalClients: counts.clientsCount,
      totalServices: counts.servicesCount,
      totalBudgets: counts.budgetsCount,
      openServices: 0,
      scheduledServices: counts.appointmentsCount,
      recentActivities: activities,
      workshopStatus: status.workshopStatus || 'trial',
      daysRemaining: status.daysRemaining || 7,
      planType: status.planType || 'basic',
      monthlyRevenue: monthlyRevenue,
      topServices: [],
      topProducts: []
    };
  }, [
    counts.clientsCount,
    counts.servicesCount, 
    counts.budgetsCount,
    counts.appointmentsCount,
    activities,
    status.workshopStatus,
    status.daysRemaining,
    status.planType,
    chartData
  ]);

  return { data, isLoading };
};
