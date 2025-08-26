
import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import WhatsAppConfig from './WhatsAppConfig';
import SupportChat from './SupportChat';
import LiveSupportChat from './LiveSupportChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Phone, Headphones } from 'lucide-react';

interface SupportSettingsProps {
  userId?: string;
  initialValues?: {
    whatsapp_suporte?: string;
  };
}

const SupportSettings: React.FC<SupportSettingsProps> = ({ 
  userId,
  initialValues = {}
}) => {
  const { userProfile } = useUserProfile();
  
  const effectiveUserId = userId || userProfile?.id;
  const supportPhone = initialValues.whatsapp_suporte || userProfile?.whatsapp_suporte || '46999324779';
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Suporte</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Entre em contato conosco através do chat ao vivo ou WhatsApp
        </p>
      </div>

      <Tabs defaultValue="live-chat" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live-chat" className="flex items-center">
            <Headphones className="w-4 h-4 mr-2" />
            Chat ao Vivo
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center">
            <MessageCircle className="w-4 h-4 mr-2" />
            IA Suporte
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            WhatsApp
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="live-chat" className="mt-6">
          <LiveSupportChat />
        </TabsContent>
        
        <TabsContent value="chat" className="mt-6">
          <SupportChat />
        </TabsContent>
        
        <TabsContent value="whatsapp" className="mt-6">
          <WhatsAppConfig 
            userId={effectiveUserId} 
            initialValue={supportPhone} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportSettings;
