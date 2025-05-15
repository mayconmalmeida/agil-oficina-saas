
import React from 'react';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';

interface EditFormData {
  nome_oficina: string;
  cnpj: string;
  responsavel: string;
  email: string;
  telefone: string;
}

interface EditUserDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  formData: EditFormData;
  setFormData: (data: EditFormData) => void;
  onSave: () => Promise<void>;
  isProcessing: boolean;
}

const EditUserDialog = ({
  showDialog,
  setShowDialog,
  formData,
  setFormData,
  onSave,
  isProcessing
}: EditUserDialogProps) => {
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Oficina</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome_oficina">Nome da Oficina</Label>
            <Input
              id="nome_oficina"
              value={formData.nome_oficina}
              onChange={(e) => setFormData({...formData, nome_oficina: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={formData.cnpj || ''}
              onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável</Label>
            <Input
              id="responsavel"
              value={formData.responsavel || ''}
              onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone || ''}
              onChange={(e) => setFormData({...formData, telefone: e.target.value})}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
          <Button onClick={onSave} disabled={isProcessing}>
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
  );
};

export default EditUserDialog;
