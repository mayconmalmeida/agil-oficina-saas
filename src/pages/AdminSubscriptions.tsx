
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionsTable from "@/components/admin/SubscriptionsTable";
import EditSubscriptionModal from '@/components/admin/subscriptions/EditSubscriptionModal';
import AdminSubscriptionsHeader from '@/components/admin/AdminSubscriptionsHeader';
import AdminSubscriptionsError from '@/components/admin/AdminSubscriptionsError';
import Loading from '@/components/ui/loading';
import { useSubscriptionsData } from '@/hooks/useSubscriptionsData';
import { useOficinasData } from '@/hooks/useOficinasData';

const AdminSubscriptions = () => {
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const { subscriptions, isLoading, error, fetchSubscriptions } = useSubscriptionsData();
  const { 
    oficinas, 
    isLoading: oficinasLoading, 
    error: oficinasError, 
    fetchOficinas 
  } = useOficinasData();

  useEffect(() => {
    fetchSubscriptions();
    fetchOficinas();
  }, [fetchSubscriptions, fetchOficinas]);

  const handleBack = () => {
    navigate('/admin');
  };

  const handleCreateNew = () => {
    setIsCreating(true);
  };

  const handleEdit = (subscription: any) => {
    setEditingSubscription(subscription);
  };

  const handleModalClose = () => {
    setEditingSubscription(null);
    setIsCreating(false);
  };

  const handleModalSuccess = () => {
    fetchSubscriptions();
    handleModalClose();
  };

  if (isLoading) {
    return <Loading fullscreen text="Carregando assinaturas..." />;
  }

  if (error) {
    return (
      <AdminSubscriptionsError 
        error={error} 
        onRetry={fetchSubscriptions}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSubscriptionsHeader
        onBack={handleBack}
        onRefresh={fetchSubscriptions}
        onCreateNew={handleCreateNew}
        isLoading={isLoading}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <SubscriptionsTable
            subscriptions={subscriptions}
            isLoading={isLoading}
            onEdit={handleEdit}
          />
        </div>
      </main>

      <EditSubscriptionModal
        subscription={editingSubscription}
        isOpen={isCreating || !!editingSubscription}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        isCreating={isCreating}
        oficinas={oficinas}
      />
    </div>
  );
};

export default AdminSubscriptions;
