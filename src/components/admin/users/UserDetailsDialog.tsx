
import React from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Pencil, 
  UserCheck, 
  Ban, 
  CalendarPlus, 
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Workshop } from '@/components/admin/UsersTable';

// Extended Workshop type with address details
export type WorkshopDetails = Workshop & {
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
};

interface UserDetailsDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  selectedWorkshop: WorkshopDetails | null;
  onEdit: (workshop: WorkshopDetails) => void;
  onChangePlan: (workshop: WorkshopDetails) => void;
  onRenewSubscription: (workshop: WorkshopDetails) => void;
  onToggleStatus: (userId: string, isActive: boolean) => void;
  onGeneratePDF: (workshop: WorkshopDetails) => void;
}

const UserDetailsDialog = ({
  showDialog,
  setShowDialog,
  selectedWorkshop,
  onEdit,
  onChangePlan,
  onRenewSubscription,
  onToggleStatus,
  onGeneratePDF
}: UserDetailsDialogProps) => {
  if (!selectedWorkshop) return null;
  
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Oficina</DialogTitle>
        </DialogHeader>
        
        {selectedWorkshop && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">Informações gerais</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Nome:</div>
                  <div>{selectedWorkshop.nome_oficina || 'Não definido'}</div>
                  
                  <div className="text-sm text-gray-500">CNPJ:</div>
                  <div>{selectedWorkshop.cnpj || 'Não definido'}</div>
                  
                  <div className="text-sm text-gray-500">Responsável:</div>
                  <div>{selectedWorkshop.responsavel || 'Não definido'}</div>
                  
                  <div className="text-sm text-gray-500">Email:</div>
                  <div>{selectedWorkshop.email}</div>
                  
                  <div className="text-sm text-gray-500">Telefone:</div>
                  <div>{selectedWorkshop.telefone || 'Não definido'}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Endereço</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Endereço:</div>
                  <div>{selectedWorkshop.endereco || 'Não definido'}</div>
                  
                  <div className="text-sm text-gray-500">Cidade:</div>
                  <div>{selectedWorkshop.cidade || 'Não definido'}</div>
                  
                  <div className="text-sm text-gray-500">Estado:</div>
                  <div>{selectedWorkshop.estado || 'Não definido'}</div>
                  
                  <div className="text-sm text-gray-500">CEP:</div>
                  <div>{selectedWorkshop.cep || 'Não definido'}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Status da assinatura</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Plano</div>
                  <div className="font-medium">
                    {selectedWorkshop.plano === 'premium' ? 'Premium' : 'Essencial'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className={`font-medium ${selectedWorkshop.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedWorkshop.is_active ? 'Ativo' : 'Desativado'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Data de cadastro</div>
                  <div>
                    {selectedWorkshop.created_at 
                      ? format(new Date(selectedWorkshop.created_at), 'dd/MM/yyyy', { locale: ptBR }) 
                      : 'N/A'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Vencimento</div>
                  <div>
                    {selectedWorkshop.trial_ends_at 
                      ? format(new Date(selectedWorkshop.trial_ends_at), 'dd/MM/yyyy', { locale: ptBR }) 
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Estatísticas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Orçamentos</div>
                  <div className="font-bold text-2xl">{selectedWorkshop.quote_count}</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Clientes</div>
                  <div className="font-bold text-2xl">-</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Produtos/Serviços</div>
                  <div className="font-bold text-2xl">-</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => onEdit(selectedWorkshop)}
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Editar Dados
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => onChangePlan(selectedWorkshop)}
                className="flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Alterar Plano
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => onRenewSubscription(selectedWorkshop)}
                className="flex items-center gap-2"
              >
                <CalendarPlus className="h-4 w-4" />
                Renovar Vencimento
              </Button>
              
              <Button 
                variant={selectedWorkshop.is_active ? "destructive" : "outline"}
                onClick={() => onToggleStatus(selectedWorkshop.id, selectedWorkshop.is_active)}
                className="flex items-center gap-2"
              >
                <Ban className="h-4 w-4" />
                {selectedWorkshop.is_active ? 'Desativar Oficina' : 'Ativar Oficina'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => onGeneratePDF(selectedWorkshop)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Gerar Fatura PDF
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
