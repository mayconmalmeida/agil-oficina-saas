import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Copy } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ServiceDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const ServiceDescriptionField: React.FC<ServiceDescriptionFieldProps> = ({
  value,
  onChange,
  error
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const exampleDescriptions = [
    {
      title: "Revisão Completa",
      description: `REVISÃO COMPLETA DO VEÍCULO

Serviços inclusos:
• Troca de óleo do motor
• Substituição do filtro de óleo
• Verificação do sistema de freios
• Checagem da suspensão
• Teste da bateria e sistema elétrico
• Análise dos pneus e alinhamento
• Inspeção geral do motor

Peças incluídas:
• Óleo motor 5W30 (5 litros)
• Filtro de óleo original
• Filtro de ar (se necessário)

Garantia: 6 meses ou 10.000 km
Prazo de execução: 1 dia útil`
    },
    {
      title: "Reparo no Sistema de Freios",
      description: `REPARO COMPLETO DO SISTEMA DE FREIOS

Diagnóstico identificado:
• Pastilhas de freio dianteiras desgastadas
• Discos com sulcos e necessidade de retífica
• Fluido de freio contaminado

Serviços a serem executados:
• Substituição das pastilhas de freio dianteiras
• Retífica dos discos de freio
• Troca completa do fluido de freio
• Limpeza do sistema
• Teste de funcionamento e regulagem

Peças utilizadas:
• Pastilhas de freio dianteiras (par)
• Fluido de freio DOT 4 (1 litro)

Garantia: 12 meses ou 20.000 km
Prazo de execução: 2 dias úteis`
    },
    {
      title: "Manutenção do Ar Condicionado",
      description: `MANUTENÇÃO PREVENTIVA DO AR CONDICIONADO

Serviços inclusos:
• Higienização do sistema de ar condicionado
• Troca do filtro do ar condicionado
• Verificação do gás refrigerante
• Limpeza do condensador
• Teste de funcionamento do sistema
• Verificação de vazamentos

Benefícios:
• Eliminação de odores
• Melhora na qualidade do ar
• Maior eficiência de refrigeração
• Prevenção de problemas futuros

Peças incluídas:
• Filtro de ar condicionado
• Produto higienizador específico

Garantia: 6 meses
Prazo de execução: Meio período`
    }
  ];

  const copyToDescription = (text: string) => {
    onChange(text);
    setIsPreviewOpen(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="descricao">Descrição do Serviço</Label>
        <Textarea
          id="descricao"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Descreva detalhadamente os serviços que serão realizados, peças utilizadas, garantias oferecidas..."
          rows={8}
          className="mt-1"
        />
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>

      <Collapsible open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <Lightbulb className="mr-2 h-4 w-4" />
            {isPreviewOpen ? 'Ocultar' : 'Ver'} Exemplos de Descrição
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">💡 Dicas para uma boa descrição:</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Seja específico sobre os serviços a serem realizados</li>
                  <li>Liste todas as peças que serão utilizadas</li>
                  <li>Informe o prazo de execução do serviço</li>
                  <li>Mencione a garantia oferecida</li>
                  <li>Inclua observações importantes sobre o diagnóstico</li>
                </ul>
              </CardContent>
            </Card>

            {exampleDescriptions.map((example, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    {example.title}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToDescription(example.description)}
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Usar
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs whitespace-pre-line bg-muted p-3 rounded">
                    {example.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ServiceDescriptionField;
