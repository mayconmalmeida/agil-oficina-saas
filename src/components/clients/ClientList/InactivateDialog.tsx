
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Client } from '@/utils/supabaseTypes';

interface InactivateDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onConfirm: () => void;
  client?: Client;
}

export const InactivateDialog: React.FC<InactivateDialogProps> = ({
  isOpen,
  setIsOpen,
  onConfirm,
  client
}) => {
  const isInactive = client?.is_active === false;
  
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isInactive ? "Ativar Cliente" : "Inativar Cliente"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isInactive
              ? "Tem certeza que deseja ativar este cliente? Ele voltará a aparecer em todas as listagens."
              : "Tem certeza que deseja inativar este cliente? Ele não será mais exibido em listagens ativas."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {isInactive ? "Ativar" : "Inativar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
