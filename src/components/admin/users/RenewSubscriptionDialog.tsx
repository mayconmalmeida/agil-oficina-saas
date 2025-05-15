
import React from 'react';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';

interface RenewSubscriptionDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  newExpireDate: string;
  setNewExpireDate: (date: string) => void;
  onRenew: () => Promise<void>;
  isProcessing: boolean;
}

const RenewSubscriptionDialog = ({
  showDialog,
  setShowDialog,
  newExpireDate,
  setNewExpireDate,
  onRenew,
  isProcessing
}: RenewSubscriptionDialogProps) => {
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
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
          <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
          <Button onClick={onRenew} disabled={isProcessing}>
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
  );
};

export default RenewSubscriptionDialog;
