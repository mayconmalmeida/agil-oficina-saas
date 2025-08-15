
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface WhatsAppConfigProps {
  userId?: string;
  initialValue?: string;
}

const WhatsAppConfig: React.FC<WhatsAppConfigProps> = ({ 
  userId, 
  initialValue = '46999324779' 
}) => {
  const [whatsappNumber, setWhatsappNumber] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "ID do usuário não encontrado"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ whatsapp_suporte: whatsappNumber })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Configuração salva",
        description: "Número do WhatsApp de suporte atualizado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar a configuração do WhatsApp"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          WhatsApp de Suporte
        </CardTitle>
        <CardDescription>
          Configure o número do WhatsApp para receber mensagens de suporte dos clientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="whatsapp">Número do WhatsApp (apenas números)</Label>
          <Input
            id="whatsapp"
            type="text"
            placeholder="46999324779"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
          />
          <p className="text-sm text-gray-500">
            Exemplo: 46999324779 (código do país + DDD + número)
          </p>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? (
            "Salvando..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configuração
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default WhatsAppConfig;
