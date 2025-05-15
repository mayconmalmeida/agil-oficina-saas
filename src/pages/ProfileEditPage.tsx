
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import ProfileSetupHeader from '@/components/profile/ProfileSetupHeader';
import { useProfileEdit } from '@/hooks/useProfileEdit';
import Loading from '@/components/ui/loading';

const ProfileEditPage: React.FC = () => {
  const { isLoading, userId, profileData, saveSuccess, handleProfileSaved } = useProfileEdit();
  
  if (isLoading) {
    return <Loading fullscreen text="Carregando perfil..." />;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <ProfileSetupHeader 
          saveSuccess={saveSuccess}
          title="Editar Perfil" 
          subtitle="Personalize seu perfil e adicione a logomarca da sua oficina"
        />
        
        <Card className={`transition-all duration-300 ${saveSuccess ? 'border-green-500 shadow-md' : ''}`}>
          <ProfileEditForm 
            userId={userId} 
            initialValues={profileData}
            onSaveSuccess={handleProfileSaved} 
          />
        </Card>
      </div>
    </div>
  );
};

export default ProfileEditPage;
