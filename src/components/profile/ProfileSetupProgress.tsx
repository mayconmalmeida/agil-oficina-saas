
import React from 'react';
import { Progress } from '@/components/ui/progress';

const ProfileSetupProgress: React.FC = () => {
  return (
    <div className="mt-4">
      <Progress value={25} className="h-2 w-full max-w-xs mx-auto" />
      <p className="text-xs text-oficina-gray mt-1">Etapa 1 de 4</p>
    </div>
  );
};

export default ProfileSetupProgress;
