import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Link as LinkIcon, CheckCircle2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WebhookAsaasPage: React.FC = () => {
  const { toast } = useToast();
  const [webhookUrl] = useState<string>('https://<seu-projeto>.functions.supabase.co/asaas-webhook');
  const [token, setToken] = useState<string>('');

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copiado!', description: 'URL copiada para a área de transferência.' });
    } catch (e) {
      toast({ title: 'Falha ao copiar', description: 'Tente copiar manualmente.', variant: 'destructive' });
    }
  };

  const handleSaveToken = () => {
    // Segurança: não persistir tokens sensíveis no frontend
    toast({ 
      title: 'Configuração necessária no backend', 
      description: 'Por segurança, configure o token do webhook diretamente nos secrets da função serverless (Supabase). Este valor não será salvo no navegador.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <LinkIcon className="h-6 w-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Webhook Asaas</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            <span>Como funciona</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>
            Configure o webhook do Asaas para enviar eventos de assinaturas e pagamentos
            para nosso endpoint. Esses eventos serão usados para atualizar o status do
            seu plano e registrar transações.
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>No painel do Asaas, acesse <strong>Integrações → Webhooks</strong>.</li>
            <li>Crie um webhook e use a URL abaixo.</li>
            <li>Selecione eventos relacionados a <strong>Assinaturas</strong> e <strong>Pagamentos</strong>.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endpoint do Webhook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URL do Webhook</Label>
            <div className="flex gap-2">
              <Input value={webhookUrl} readOnly />
              <Button variant="outline" onClick={() => copyToClipboard(webhookUrl)}>
                <Copy className="h-4 w-4 mr-2" /> Copiar
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Substitua <code>&lt;seu-projeto&gt;</code> pela URL do seu projeto Supabase.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Token/Chave de Assinatura (opcional)</Label>
            <Input
              placeholder="Informe o token de segurança do webhook (se aplicável)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <Button onClick={handleSaveToken}>
              <CheckCircle2 className="h-4 w-4 mr-2" /> Orientar configuração segura
            </Button>
            <p className="text-sm text-gray-500">
              Este campo é apenas ilustrativo nesta etapa. A persistência definitiva
              deve ser feita no backend (função serverless) para validação segura.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookAsaasPage;