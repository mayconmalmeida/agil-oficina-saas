
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Brain, Loader2, Send } from 'lucide-react';
import { callAI } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';

const IASuporteInteligentePage: React.FC = () => {
  const [pergunta, setPergunta] = useState('');
  const [resposta, setResposta] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pergunta.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, digite sua pergunta.",
      });
      return;
    }

    setIsLoading(true);
    setResposta('');

    try {
      const result = await callAI('suporte', pergunta);
      
      if (result.success && result.answer) {
        setResposta(result.answer);
        toast({
          title: "Resposta gerada",
          description: "O IA Suporte analisou sua pergunta.",
        });
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao consultar IA:', error);
      toast({
        variant: "destructive",
        title: "Erro na consulta",
        description: error instanceof Error ? error.message : "Não foi possível processar sua pergunta.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">IA Suporte Inteligente</h1>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          <Brain className="h-4 w-4 mr-1" />
          Assistente Virtual
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Faça sua pergunta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Digite sua pergunta sobre problemas técnicos, dúvidas sobre o sistema, ou qualquer questão relacionada à sua oficina..."
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              className="min-h-32"
            />
            
            <Button 
              type="submit" 
              disabled={isLoading || !pergunta.trim()}
              className="w-full sm:w-auto"
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
        </CardContent>
      </Card>

      {resposta && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Resposta do IA Suporte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{resposta}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IASuporteInteligentePage;
