
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import ProfileSetupProgress from './ProfileSetupProgress';

interface ProfileSetupHeaderProps {
  saveSuccess?: boolean;
}

const ProfileSetupHeader: React.FC<ProfileSetupHeaderProps> = ({ saveSuccess = false }) => {
  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-oficina-dark">
          Configure sua Oficina
        </h1>
        <p className="mt-2 text-oficina-gray">
          Preencha as informações básicas da sua oficina
        </p>
        
        <ProfileSetupProgress />
      </div>
      
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Informações da Oficina</span>
          {saveSuccess && <CheckCircle className="h-5 w-5 text-green-500 animate-fade-in" />}
        </CardTitle>
        <CardDescription>
          Estas informações aparecerão nos orçamentos e comunicações com seus clientes
        </CardDescription>
      </CardHeader>
    </>
  );
};

export default ProfileSetupHeader;
