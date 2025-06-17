
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { callAI } from '@/services/aiService';

const DiagnosticoIA: React.FC = () => {
  const [sintomas, setSintomas] = useState('');
  const [causas, setCausas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDiagnostico = async () => {
    if (!sintomas.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, descreva os sintomas do veículo.",
      });
      return;
    }

    setIsLoading(true);
    setCausas([]);

    try {
      const response = await callAI('diagnostico', sintomas);

      if (response.success && response.causes) {
        setCausas(response.causes);
        toast({
          title: "Diagnóstico concluído",
          description: `${response.causes.length} possíveis causas identificadas.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro no diagnóstico",
          description: response.error || "Não foi possível processar o diagnóstico. Tente novamente.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no diagnóstico",
        description: "Erro de conexão. Verifique sua internet e tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Descreva os Sintomas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ex: O carro está fazendo um barulho estranho no motor quando acelero, principalmente em subidas. O barulho parece um 'batimento' metálico e acontece mais quando o motor está quente..."
            value={sintomas}
            onChange={(e) => setSintomas(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <Button 
            onClick={handleDiagnostico} 
            disabled={isLoading || !sintomas.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              'Diagnosticar com IA'
            )}
          </Button>
        </CardContent>
      </Card>

      {causas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Possíveis Causas Identificadas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {causas.map((causa, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{causa}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Importante</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Este diagnóstico é uma análise preliminar baseada em IA. Para um diagnóstico definitivo, 
                    recomendamos uma inspeção física detalhada do veículo.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DiagnosticoIA;
