
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SupportCard: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Suporte</CardTitle>
        <CardDescription>Precisa de ajuda?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Nossa equipe está pronta para ajudar você a aproveitar ao máximo o OficinaÁgil.</p>
        <Button className="w-full">Central de Ajuda</Button>
        <Button variant="outline" className="w-full">Contato</Button>
      </CardContent>
    </Card>
  );
};

export default SupportCard;
