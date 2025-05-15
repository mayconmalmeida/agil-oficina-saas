
import { useState, useEffect } from 'react';
import { useWorkshopsList } from './workshop/useWorkshopsList';
import { useWorkshopDetails } from './workshop/useWorkshopDetails';
import { useWorkshopEdit } from './workshop/useWorkshopEdit';
import { useWorkshopPlan } from './workshop/useWorkshopPlan';
import { useWorkshopSubscription } from './workshop/useWorkshopSubscription';
import { Workshop } from '@/components/admin/UsersTable';
import { WorkshopDetails } from '@/components/admin/users/UserDetailsDialog';

export const useWorkshops = () => {
  // Import functionality from specialized hooks
  const {
    workshops,
    isLoading,
    loadWorkshops,
    handleToggleStatus,
    generatePDFInvoice,
    handleViewBudgets
  } = useWorkshopsList();

  // Workshop details
  const {
    selectedWorkshop: detailsWorkshop,
    setSelectedWorkshop: setDetailsWorkshop,
    showDetailsDialog,
    setShowDetailsDialog,
    handleViewDetails
  } = useWorkshopDetails();

  // Workshop editing
  const {
    selectedWorkshop: editWorkshop,
    setSelectedWorkshop: setEditWorkshop,
    showEditDialog,
    setShowEditDialog,
    editFormData,
    setEditFormData,
    isProcessing: isEditProcessing,
    handleEditWorkshop,
    handleSaveEdit
  } = useWorkshopEdit(loadWorkshops);

  // Workshop plan management
  const {
    selectedWorkshop: planWorkshop,
    setSelectedWorkshop: setPlanWorkshop,
    showPlanDialog,
    setShowPlanDialog,
    currentPlan,
    setCurrentPlan,
    isProcessing: isPlanProcessing,
    handleChangePlan,
    handleSavePlanChange
  } = useWorkshopPlan(loadWorkshops);

  // Workshop subscription management
  const {
    selectedWorkshop: subscriptionWorkshop,
    setSelectedWorkshop: setSubscriptionWorkshop,
    showRenewDialog,
    setShowRenewDialog,
    newExpireDate,
    setNewExpireDate,
    isProcessing: isSubscriptionProcessing,
    handleRenewSubscription,
    handleRenewSubmit
  } = useWorkshopSubscription(loadWorkshops);

  // Synchronize selected workshop between different hooks
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopDetails | null>(null);

  useEffect(() => {
    if (detailsWorkshop) setSelectedWorkshop(detailsWorkshop);
    else if (editWorkshop) setSelectedWorkshop(editWorkshop);
    else if (planWorkshop) setSelectedWorkshop(planWorkshop);
    else if (subscriptionWorkshop) setSelectedWorkshop(subscriptionWorkshop);
  }, [detailsWorkshop, editWorkshop, planWorkshop, subscriptionWorkshop]);

  const isProcessing = isEditProcessing || isPlanProcessing || isSubscriptionProcessing;

  // We're exposing the same API as the original hook to maintain compatibility
  return {
    workshops,
    isLoading,
    selectedWorkshop,
    showDetailsDialog,
    setShowDetailsDialog,
    showEditDialog,
    setShowEditDialog,
    showRenewDialog,
    setShowRenewDialog,
    showPlanDialog,
    setShowPlanDialog,
    currentPlan,
    setCurrentPlan,
    newExpireDate,
    setNewExpireDate,
    editFormData,
    setEditFormData,
    isProcessing,
    loadWorkshops,
    handleViewDetails,
    handleEditWorkshop,
    handleChangePlan,
    handleRenewSubscription,
    handleToggleStatus,
    handleSaveEdit,
    handleSavePlanChange,
    handleRenewSubmit,
    generatePDFInvoice,
    handleViewBudgets
  };
};
