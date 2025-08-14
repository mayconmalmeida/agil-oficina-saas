
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { callAI } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';

const IASuportePage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, digite sua pergunta."
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await callAI('suporte', message);
      
      if (result.success && result.answer) {
        setResponse(result.answer);
      } else {
        toast({
          variant: "destructive",
          title: "Erro no suporte IA",
          description: result.error || "Não foi possível obter resposta do suporte IA."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao conectar com o suporte IA."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">IA Suporte Inteligente</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Assistente Virtual</CardTitle>
          <CardDescription>
            Faça perguntas sobre gestão da oficina, dúvidas técnicas ou solicite suporte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Sua pergunta ou dúvida:
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Como posso melhorar o atendimento aos clientes? Como organizar melhor o estoque?"
                className="min-h-20"
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading || !message.trim()}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Pergunta
                </>
              )}
            </Button>
          </form>
          
          {response && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resposta do Assistente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-gray-700">
                  {response}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IASuportePage;
