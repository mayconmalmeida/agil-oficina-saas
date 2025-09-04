import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Lock, MessageCircle, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const WhatsAppSettings: React.FC = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('46999324779');
  const [isEditable, setIsEditable] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Apenas admins do sistema podem editar o número do WhatsApp
    // Usuários oficina não têm permissão para alterar este número
    const isSystemAdmin = user?.email === 'admin@oficinago.com' || user?.role === 'admin';
    setIsEditable(isSystemAdmin);
  }, [user]);

  const handleSave = () => {
    // Simular salvamento (em produção seria uma chamada à API)
    toast({
      title: "Configurações salvas",
      description: "Número do WhatsApp atualizado com sucesso.",
    });
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2$3$4');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          Configurações do WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800">WhatsApp Comercial</span>
            <Badge variant="outline" className="text-green-700 border-green-300">
              Ativo
            </Badge>
          </div>
          <p className="text-sm text-green-700">
            Este número receberá todas as mensagens do suporte integrado.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp-number">Número do WhatsApp</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="whatsapp-number"
                value={formatPhoneNumber(whatsappNumber)}
                onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="46999324779"
                disabled={!isEditable}
                className={!isEditable ? 'bg-gray-50' : ''}
              />
              {!isEditable && (
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              )}
            </div>
            {isEditable && (
              <Button onClick={handleSave}>
                Salvar
              </Button>
            )}
          </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Este número é gerenciado pela administração do sistema</span>
            </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Como funciona:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Mensagens do chat de suporte são direcionadas para este WhatsApp</li>
            <li>• Clientes podem entrar em contato diretamente pelo sistema</li>
            <li>• Respostas do WhatsApp aparecem automaticamente no sistema</li>
            <li>• Integração em tempo real para suporte eficiente</li>
          </ul>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Status da Integração</h4>
              <p className="text-sm text-muted-foreground">WhatsApp Business API</p>
            </div>
            <Badge className="bg-green-100 text-green-800">
              Conectado
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppSettings;