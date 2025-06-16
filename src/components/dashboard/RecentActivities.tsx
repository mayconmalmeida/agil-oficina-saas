
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, FileText, Package } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Define types for activities - updated to match backend
type ActivityType = 'client' | 'budget' | 'service' | 'appointment';

export type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  createdAt: Date | string;
};

type RecentActivitiesProps = {
  activities: Activity[];
  isLoading?: boolean;
};

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'client':
      return <User className="h-4 w-4 text-blue-500" />;
    case 'budget':
      return <FileText className="h-4 w-4 text-amber-500" />;
    case 'service':
      return <Package className="h-4 w-4 text-green-500" />;
    case 'appointment':
      return <Calendar className="h-4 w-4 text-purple-500" />;
    default:
      return <Calendar className="h-4 w-4 text-gray-500" />;
  }
};

const RecentActivities = ({ activities, isLoading = false }: RecentActivitiesProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 py-3">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start space-x-4 py-3 border-b border-gray-100 last:border-0"
              >
                <div className="p-2 rounded-full bg-gray-50">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                </div>
                <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
                  <Clock className="h-3 w-3 mr-1" />
                  {typeof activity.createdAt === 'string' 
                    ? formatDistanceToNow(new Date(activity.createdAt), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })
                    : formatDistanceToNow(new Date(activity.createdAt), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
