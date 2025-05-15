
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ProfileSetupHeaderProps {
  saveSuccess?: boolean;
  title?: string;
  subtitle?: string;
}

const ProfileSetupHeader: React.FC<ProfileSetupHeaderProps> = ({ 
  saveSuccess = false,
  title = "Configure seu Perfil",
  subtitle = "Informe os dados básicos da sua oficina"
}) => {
  return (
    <div className="text-center mb-6 relative">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-gray-600 mb-1">{subtitle}</p>
      
      {saveSuccess && (
        <div className="absolute -top-5 -right-5 bg-green-100 p-2 rounded-full animate-bounce">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
      )}
    </div>
  );
};

export default ProfileSetupHeader;
