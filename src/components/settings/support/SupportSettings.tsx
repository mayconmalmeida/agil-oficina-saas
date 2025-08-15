
import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import WhatsAppConfig from './WhatsAppConfig';
import MessageForm from './MessageForm';

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
  
  // Get user ID from profile if not provided via props
  const effectiveUserId = userId || userProfile?.id;
  const supportPhone = initialValues.whatsapp_suporte || userProfile?.whatsapp_suporte || '46999324779';
  
  return (
    <div className="space-y-8">
      <WhatsAppConfig 
        userId={effectiveUserId} 
        initialValue={supportPhone} 
      />
      
      <MessageForm supportPhone={supportPhone} />
    </div>
  );
};

export default SupportSettings;
