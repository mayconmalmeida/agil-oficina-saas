
import React from 'react';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';

interface ChangePlanDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  currentPlan: string;
  setCurrentPlan: (plan: string) => void;
  onSave: () => Promise<void>;
  isProcessing: boolean;
}

const ChangePlanDialog = ({
  showDialog,
  setShowDialog,
  currentPlan,
  setCurrentPlan,
  onSave,
  isProcessing
}: ChangePlanDialogProps) => {
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
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

export default ChangePlanDialog;
