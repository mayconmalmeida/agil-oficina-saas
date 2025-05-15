
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Pencil, 
  UserCheck, 
  Ban, 
  Eye, 
  Loader2, 
  CalendarPlus, 
  FileText,
  RefreshCw
} from "lucide-react";
import DashboardHeader from "@/components/admin/DashboardHeader";
import UsersHeader from "@/components/admin/UsersHeader";
import UsersTable from "@/components/admin/UsersTable";
import { Label } from '@/components/ui/label';

type Workshop = {
  id: string;
  nome_oficina: string;
  email: string;
  telefone: string | null;
  cnpj: string | null;
  responsavel: string | null;
  plano: string | null;
  is_active: boolean;
  created_at: string;
  trial_ends_at: string | null;
  subscription_status: string;
  quote_count: number;
};

type WorkshopDetails = Workshop & {
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
};

const AdminUsers = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopDetails | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [newExpireDate, setNewExpireDate] = useState<string>('');
  const [editFormData, setEditFormData] = useState({
    nome_oficina: '',
    cnpj: '',
    responsavel: '',
    email: '',
    telefone: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuthAndLoadData();
  }, []);

  const checkAdminAuthAndLoadData = async () => {
    setIsLoading(true);
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

  const loadWorkshops = async () => {
    try {
      // Get all workshop profiles with subscription status
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*, subscriptions(status, ends_at, started_at)')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Get quote counts for each workshop
      const workshopsWithStats = await Promise.all(profiles.map(async (profile) => {
        const { count, error: countError } = await supabase
          .from('orcamentos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        const subscription = profile.subscriptions?.[0] || {};
        const subscription_status = subscription.status || 'inactive';
        const trial_ends_at = profile.trial_ends_at;
        
        return {
          ...profile,
          quote_count: count || 0,
          subscription_status,
          trial_ends_at
        };
      }));

      setWorkshops(workshopsWithStats);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar oficinas",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (userId: string) => {
    try {
      setIsProcessing(true);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      const subscription = subscriptionData?.[0] || {};

      // Get quote counts
      const { count: quoteCount } = await supabase
        .from('orcamentos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      setSelectedWorkshop({
        ...profile,
        quote_count: quoteCount || 0,
        subscription_status: subscription.status || 'inactive'
      });
      setShowDetailsDialog(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar detalhes",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

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

  const handleChangePlan = (workshop: Workshop) => {
    setSelectedWorkshop(workshop as WorkshopDetails);
    setCurrentPlan(workshop.plano || 'essencial');
    setShowPlanDialog(true);
  };

  const handleRenewSubscription = (workshop: Workshop) => {
    setSelectedWorkshop(workshop as WorkshopDetails);
    
    // Set default expiration date to 30 days from today
    const defaultExpireDate = new Date();
    defaultExpireDate.setDate(defaultExpireDate.getDate() + 30);
    
    setNewExpireDate(defaultExpireDate.toISOString().split('T')[0]);
    setShowRenewDialog(true);
  };

  const handleToggleStatus = async (userId: string, isCurrentlyActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !isCurrentlyActive })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: isCurrentlyActive ? "Oficina desativada" : "Oficina ativada",
        description: `A oficina foi ${isCurrentlyActive ? 'desativada' : 'ativada'} com sucesso.`,
      });

      // Refresh the list
      loadWorkshops();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: error.message,
      });
    }
  };

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

  const handleSavePlanChange = async () => {
    if (!selectedWorkshop) return;
    
    setIsProcessing(true);
    try {
      // Update profile plan
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ plano: currentPlan })
        .eq('id', selectedWorkshop.id);

      if (profileError) throw profileError;

      // Create or update subscription
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', selectedWorkshop.id)
        .eq('status', 'active')
        .maybeSingle();

      if (existingSubscription) {
        // Update existing subscription
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({ 
            plan: currentPlan,
          })
          .eq('id', existingSubscription.id);

        if (subError) throw subError;
      } else {
        // Create new subscription
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30); // 30 days from now
        
        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: selectedWorkshop.id,
            plan: currentPlan,
            status: 'active',
            expires_at: endDate.toISOString()
          });

        if (subError) throw subError;
      }

      toast({
        title: "Plano atualizado",
        description: `O plano foi alterado para ${currentPlan === 'premium' ? 'Premium' : 'Essencial'} com sucesso.`,
      });

      setShowPlanDialog(false);
      loadWorkshops();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar plano",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRenewSubmit = async () => {
    if (!selectedWorkshop || !newExpireDate) return;
    
    setIsProcessing(true);
    try {
      const expireDate = new Date(newExpireDate);
      
      // Update trial_ends_at in profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ trial_ends_at: expireDate.toISOString() })
        .eq('id', selectedWorkshop.id);

      if (profileError) throw profileError;

      // Create or update subscription
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', selectedWorkshop.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingSubscription && existingSubscription.length > 0) {
        // Update existing subscription
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({ 
            status: 'active',
            expires_at: expireDate.toISOString()
          })
          .eq('id', existingSubscription[0].id);

        if (subError) throw subError;
      } else {
        // Create new subscription
        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: selectedWorkshop.id,
            plan: selectedWorkshop.plano || 'essencial',
            status: 'active',
            expires_at: expireDate.toISOString()
          });

        if (subError) throw subError;
      }

      toast({
        title: "Assinatura renovada",
        description: `A assinatura foi renovada com vencimento para ${format(expireDate, 'dd/MM/yyyy')}.`,
      });

      setShowRenewDialog(false);
      loadWorkshops();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao renovar assinatura",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generatePDFInvoice = async (workshop: Workshop) => {
    // This is a placeholder. In a real app, this would generate a PDF invoice.
    toast({
      title: "Função em desenvolvimento",
      description: "A geração de faturas em PDF será implementada em breve.",
    });
  };

  const handleRefreshData = () => {
    loadWorkshops();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleViewBudgets = (userId: string) => {
    // Placeholder for budget viewing functionality
    toast({
      title: "Função em desenvolvimento",
      description: "A visualização de orçamentos será implementada em breve.",
    });
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

      {/* Workshop Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
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
                  
                  {/* Placeholder for additional metrics */}
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
                  onClick={() => handleEditWorkshop(selectedWorkshop)}
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Editar Dados
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => handleChangePlan(selectedWorkshop)}
                  className="flex items-center gap-2"
                >
                  <UserCheck className="h-4 w-4" />
                  Alterar Plano
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => handleRenewSubscription(selectedWorkshop)}
                  className="flex items-center gap-2"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Renovar Vencimento
                </Button>
                
                <Button 
                  variant={selectedWorkshop.is_active ? "destructive" : "outline"}
                  onClick={() => handleToggleStatus(selectedWorkshop.id, selectedWorkshop.is_active)}
                  className="flex items-center gap-2"
                >
                  <Ban className="h-4 w-4" />
                  {selectedWorkshop.is_active ? 'Desativar Oficina' : 'Ativar Oficina'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => generatePDFInvoice(selectedWorkshop)}
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

      {/* Edit Workshop Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Oficina</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome_oficina">Nome da Oficina</Label>
              <Input
                id="nome_oficina"
                value={editFormData.nome_oficina}
                onChange={(e) => setEditFormData({...editFormData, nome_oficina: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={editFormData.cnpj || ''}
                onChange={(e) => setEditFormData({...editFormData, cnpj: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                value={editFormData.responsavel || ''}
                onChange={(e) => setEditFormData({...editFormData, responsavel: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={editFormData.telefone || ''}
                onChange={(e) => setEditFormData({...editFormData, telefone: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Plano</DialogTitle>
            <DialogDescription>
              Escolha o novo plano para esta oficina.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plan">Plano</Label>
              <Select 
                value={currentPlan} 
                onValueChange={(value) => setCurrentPlan(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essencial">Essencial</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanDialog(false)}>Cancelar</Button>
            <Button onClick={handleSavePlanChange} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Renew Subscription Dialog */}
      <Dialog open={showRenewDialog} onOpenChange={setShowRenewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renovar Vencimento</DialogTitle>
            <DialogDescription>
              Defina a nova data de vencimento para a assinatura desta oficina.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="expireDate">Data de Vencimento</Label>
              <Input
                id="expireDate"
                type="date"
                value={newExpireDate}
                onChange={(e) => setNewExpireDate(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenewDialog(false)}>Cancelar</Button>
            <Button onClick={handleRenewSubmit} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Renovar Assinatura'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
