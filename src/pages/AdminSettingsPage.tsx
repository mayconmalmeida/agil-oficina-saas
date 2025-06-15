
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

const AdminSettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 sm:px-4">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <CardTitle>Configurações do Painel Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <span className="text-gray-700 font-medium block mb-2">Opções Gerais</span>
                <p className="text-gray-600 text-sm">
                  Esta tela permitirá, futuramente, ajustar preferências do painel admin, como redefinição de senha, alterar nome do painel ou idioma.
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4 text-blue-900 text-sm">
                Para sugestões ou dúvidas, entre em contato com o suporte. Novas opções estarão disponíveis em breve!
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
