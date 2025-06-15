
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubscriptionStatus } from "@/types/subscription";

interface SubscriptionInfoCardProps {
  subscriptionStatus: SubscriptionStatus;
}

const SubscriptionInfoCard: React.FC<SubscriptionInfoCardProps> = ({
  subscriptionStatus,
}) => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-blue-900">
              {subscriptionStatus.planDetails?.name || "Sem plano"}
            </div>
            {subscriptionStatus.isTrialActive && (
              <div className="text-xs text-blue-600">
                {subscriptionStatus.daysRemaining} dias restantes
              </div>
            )}
          </div>
          {subscriptionStatus.isPremium && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Premium
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionInfoCard;
