
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import DashboardHeader from "@/components/admin/DashboardHeader";
import UsersHeader from "@/components/admin/UsersHeader";
import UsersTable from "@/components/admin/UsersTable";
import UserDetailsDialog from '@/components/admin/users/UserDetailsDialog';
import EditUserDialog from '@/components/admin/users/EditUserDialog';
import ChangePlanDialog from '@/components/admin/users/ChangePlanDialog';
import RenewSubscriptionDialog from '@/components/admin/users/RenewSubscriptionDialog';
import { useWorkshops } from '@/hooks/admin/useWorkshops';

const AdminUsers = () => {
  const { 
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
  } = useWorkshops();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuthAndLoadData();
  }, []);

  const checkAdminAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/admin/login');
      return;
    }

    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (!adminData) {
      await supabase.auth.signOut();
      navigate('/admin/login');
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Você não tem permissão de administrador.",
      });
      return;
    }

    await loadWorkshops();
  };

  const handleRefreshData = () => {
    loadWorkshops();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Gerenciamento de Oficinas"
        onLogout={handleLogout} 
      />
      
      <UsersHeader onBack={() => navigate('/admin/dashboard')} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-end mb-4">
          <Button onClick={handleRefreshData} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar dados
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Oficinas cadastradas</h3>
            <UsersTable 
              users={workshops}
              isLoading={isLoading}
              onToggleStatus={handleToggleStatus}
              onViewQuotes={handleViewBudgets}
              onViewDetails={handleViewDetails}
              onEditUser={handleEditWorkshop}
              onChangePlan={handleChangePlan}
              onRenewSubscription={handleRenewSubscription}
              onGeneratePDF={generatePDFInvoice}
            />
          </div>
        </div>
      </main>

      {/* User Details Dialog */}
      <UserDetailsDialog 
        showDialog={showDetailsDialog}
        setShowDialog={setShowDetailsDialog}
        selectedWorkshop={selectedWorkshop}
        onEdit={handleEditWorkshop}
        onChangePlan={handleChangePlan}
        onRenewSubscription={handleRenewSubscription}
        onToggleStatus={handleToggleStatus}
        onGeneratePDF={generatePDFInvoice}
      />

      {/* Edit User Dialog */}
      <EditUserDialog 
        showDialog={showEditDialog}
        setShowDialog={setShowEditDialog}
        formData={editFormData}
        setFormData={setEditFormData}
        onSave={handleSaveEdit}
        isProcessing={isProcessing}
      />

      {/* Change Plan Dialog */}
      <ChangePlanDialog 
        showDialog={showPlanDialog}
        setShowDialog={setShowPlanDialog}
        currentPlan={currentPlan}
        setCurrentPlan={setCurrentPlan}
        onSave={handleSavePlanChange}
        isProcessing={isProcessing}
      />

      {/* Renew Subscription Dialog */}
      <RenewSubscriptionDialog 
        showDialog={showRenewDialog}
        setShowDialog={setShowRenewDialog}
        newExpireDate={newExpireDate}
        setNewExpireDate={setNewExpireDate}
        onRenew={handleRenewSubmit}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default AdminUsers;
