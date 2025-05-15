
import { Activity } from '@/components/dashboard/RecentActivities';

export type WorkshopStatus = 'active' | 'trial' | 'expired';

export type DashboardData = {
  totalClients: number;
  totalServices: number;
  totalBudgets: number;
  recentActivities: Activity[];
  workshopStatus: WorkshopStatus;
  daysRemaining: number;
  planType: string;
  openServices: number;
  scheduledServices: number;
  monthlyRevenue: { month: string; value: number }[];
  topServices: { name: string; value: number }[];
  topProducts: { name: string; value: number }[];
};
