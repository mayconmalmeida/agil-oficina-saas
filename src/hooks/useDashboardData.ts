
import { useState, useEffect } from 'react';
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
  const { status, isLoading: statusLoading } = useWorkshopStatus();
  const chartData = useChartData();
  
  const [data, setData] = useState<DashboardData>({
    totalClients: 0,
    totalServices: 0,
    totalBudgets: 0,
    openServices: 0,
    scheduledServices: 0,
    recentActivities: [],
    workshopStatus: 'trial',
    daysRemaining: 7,
    planType: 'basic',
    monthlyRevenue: [],
    topServices: [],
    topProducts: []
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // Combine all data into a single state
  useEffect(() => {
    // Convert chart data to expected format
    const monthlyRevenue = chartData.chartData.map(item => ({
      month: item.name,
      value: item.value
    }));

    setData({
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
    });
    
    // Consider loading complete when all data sources are loaded
    setIsLoading(countsLoading || activitiesLoading || statusLoading);
  }, [
    counts, 
    activities, 
    status, 
    chartData, 
    countsLoading, 
    activitiesLoading, 
    statusLoading
  ]);

  return { data, isLoading };
};
