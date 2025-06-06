
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { callAI } from '@/services/aiService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DiagnosticoIA: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Verificar se é usuário premium
  const isPremium = user?.subscription?.plan_type?.includes('premium') || false;

  if (!user || !isPremium) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Brain className="h-6 w-6" />
            Diagnóstico Inteligente (Premium)
          </CardTitle>
          <CardDescription className="text-blue-700">
            Este recurso avançado está disponível apenas para assinantes do Plano Premium.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 mb-4">
            Desbloqueie o poder da IA para diagnosticar problemas mecânicos com precisão!
          </p>
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Fazer Upgrade para Premium
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleDiagnose = async () => {
    if (!symptoms.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, descreva os sintomas do veículo.",
      });
      return;
    }

    setLoading(true);
    setDiagnosis([]);

    try {
      const result = await callAI('diagnostico', symptoms);
      
      if (result.success && result.causes) {
        setDiagnosis(result.causes);
        toast({
          title: "Diagnóstico concluído",
          description: "A IA analisou os sintomas e forneceu possíveis causas.",
        });
      } else {
        throw new Error(result.error || 'Erro ao processar diagnóstico');
      }
    } catch (error) {
      console.error("Erro ao diagnosticar:", error);
      toast({
        variant: "destructive",
        title: "Erro no diagnóstico",
        description: "Não foi possível processar o diagnóstico. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Brain className="h-6 w-6 text-blue-600" />
          Diagnóstico de Problemas Mecânicos com IA
        </CardTitle>
        <CardDescription>
          Descreva os sintomas do veículo para obter possíveis causas baseadas em IA
        </CardDescription>
        <Badge variant="secondary" className="w-fit">
          Premium
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sintomas do Veículo
          </label>
          <Textarea
            rows={4}
            placeholder="Ex: 'Carro falha nas subidas e sai fumaça azul no escapamento. Motor faz ruído estranho quando acelero.'"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full"
          />
        </div>

        <Button
          onClick={handleDiagnose}
          disabled={loading || !symptoms.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analisando sintomas...
            </>
          ) : (
            'Diagnosticar com IA'
          )}
        </Button>

        {diagnosis.length > 0 && (
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-gray-700">
                Possíveis Causas Identificadas:
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {diagnosis.map((cause, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span className="text-gray-700">{cause}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticoIA;
