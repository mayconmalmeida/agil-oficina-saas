
import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import SupportChat from './SupportChat';
import LiveSupportChat from './LiveSupportChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Headphones } from 'lucide-react';

interface SupportSettingsProps {
  userId?: string;
  initialValues?: {
    whatsapp_suporte?: string;
  };
}

const SupportSettings: React.FC<SupportSettingsProps> = ({ 
  userId,
  initialValues
}) => {
  const { userProfile } = useUserProfile();
  
  const effectiveUserId = userId || userProfile?.id;
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Suporte e Ajuda</h2>
        <p className="text-sm text-gray-500">
          Entre em contato conosco através do chat ao vivo ou IA de suporte
        </p>
      </div>

      <Tabs defaultValue="live-chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="live-chat" className="flex items-center">
            <Headphones className="w-4 h-4 mr-2" />
            Chat ao Vivo
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center">
            <MessageCircle className="w-4 h-4 mr-2" />
            IA Suporte
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="live-chat" className="mt-6">
          <LiveSupportChat />
        </TabsContent>
        
        <TabsContent value="chat" className="mt-6">
          <SupportChat />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportSettings;
