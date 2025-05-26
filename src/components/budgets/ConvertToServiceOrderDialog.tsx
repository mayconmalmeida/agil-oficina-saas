
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ConvertToServiceOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { startDate: Date; notes: string }) => void;
  budgetData: any;
  isLoading?: boolean;
}

const ConvertToServiceOrderDialog: React.FC<ConvertToServiceOrderDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  budgetData,
  isLoading = false
}) => {
  const [startDate, setStartDate] = useState<Date>();
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    if (!startDate) {
      return;
    }
    
    onConfirm({
      startDate,
      notes
    });
  };

  const handleClose = () => {
    setStartDate(undefined);
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Converter para Ordem de Serviço</DialogTitle>
          <DialogDescription>
            Este orçamento será convertido em uma ordem de serviço. 
            Defina a data de início dos trabalhos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Orçamento</Label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-medium">{budgetData?.cliente}</p>
              <p className="text-sm text-gray-600">{budgetData?.veiculo}</p>
              <p className="text-sm font-medium text-green-600">
                {budgetData?.valor_total?.toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                })}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data de Início dos Trabalhos</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações da OS (Opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Digite observações para a ordem de serviço..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!startDate || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Convertendo...
              </>
            ) : (
              'Converter para OS'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertToServiceOrderDialog;
