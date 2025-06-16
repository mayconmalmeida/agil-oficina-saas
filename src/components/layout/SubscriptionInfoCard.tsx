
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionStatus } from "@/types/subscription";
import DaysRemainingCounter from "@/components/subscription/DaysRemainingCounter";

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
            <div className="mt-1">
              <DaysRemainingCounter />
            </div>
          </div>
          {subscriptionStatus.isPremium && (
            <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
              Premium
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionInfoCard;
