
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Workshop } from '@/components/admin/UsersTable';
import { WorkshopDetails } from '@/components/admin/users/UserDetailsDialog';
import { EditFormData } from './types';

export const useWorkshopEdit = (loadWorkshops: () => Promise<void>) => {
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopDetails | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    nome_oficina: '',
    cnpj: '',
    responsavel: '',
    email: '',
    telefone: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();

  // Edit workshop
  const handleEditWorkshop = (workshop: Workshop) => {
    setEditFormData({
      nome_oficina: workshop.nome_oficina || '',
      cnpj: workshop.cnpj || '',
      responsavel: workshop.responsavel || '',
      email: workshop.email || '',
      telefone: workshop.telefone || '',
    });
    setSelectedWorkshop(workshop as WorkshopDetails);
    setShowEditDialog(true);
  };

  // Save workshop edit
  const handleSaveEdit = async () => {
    if (!selectedWorkshop) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome_oficina: editFormData.nome_oficina,
          email: editFormData.email,
          telefone: editFormData.telefone,
          cnpj: editFormData.cnpj,
          responsavel: editFormData.responsavel
        })
        .eq('id', selectedWorkshop.id);

      if (error) throw error;

      toast({
        title: "Oficina atualizada",
        description: "Os dados da oficina foram atualizados com sucesso.",
      });

      setShowEditDialog(false);
      loadWorkshops();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar oficina",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    selectedWorkshop,
    setSelectedWorkshop,
    showEditDialog,
    setShowEditDialog,
    editFormData,
    setEditFormData,
    isProcessing,
    handleEditWorkshop,
    handleSaveEdit
  };
};
