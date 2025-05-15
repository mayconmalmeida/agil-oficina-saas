
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, HelpCircle } from 'lucide-react';
import SupportButton from './SupportButton';

const SupportCard: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-oficina-accent" />
          Precisa de Ajuda?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Estamos disponíveis para ajudar com qualquer dúvida ou problema que você esteja enfrentando.
        </p>
        
        <SupportButton className="w-full" />
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Horário de atendimento:</p>
          <p>Segunda a Sexta: 8h às 18h</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportCard;
