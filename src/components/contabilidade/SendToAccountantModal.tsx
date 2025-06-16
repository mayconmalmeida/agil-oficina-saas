
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SendToAccountantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SendToAccountantModal: React.FC<SendToAccountantModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Documentos Contábeis - ' + new Date().toLocaleDateString());
  const [message, setMessage] = useState('Segue em anexo os documentos contábeis do período solicitado.');
  const [includeEntrada, setIncludeEntrada] = useState(true);
  const [includeSaida, setIncludeSaida] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "E-mail obrigatório",
        description: "Informe o e-mail do contador",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Período obrigatório",
        description: "Selecione o período dos documentos",
      });
      return;
    }

    setIsSending(true);
    try {
      // Simular envio de e-mail
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "E-mail enviado com sucesso",
        description: `Documentos enviados para ${email}`,
      });

      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar e-mail",
        description: error.message,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar para Contador</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail do contador</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contador@empresa.com.br"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start-date">Data inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">Data final</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Incluir documentos:</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="entrada"
                  checked={includeEntrada}
                  onCheckedChange={(checked) => setIncludeEntrada(checked === true)}
                />
                <Label htmlFor="entrada">Notas de Entrada</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="saida"
                  checked={includeSaida}
                  onCheckedChange={(checked) => setIncludeSaida(checked === true)}
                />
                <Label htmlFor="saida">Notas de Saída</Label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={isSending}
              className="flex-1"
            >
              {isSending ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendToAccountantModal;
