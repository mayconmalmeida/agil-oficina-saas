
import React from 'react';
import { Card } from '@/components/ui/card';
import ProfileSetupHeader from '@/components/profile/ProfileSetupHeader';
import ProfileSetupForm from '@/components/profile/ProfileSetupForm';
import { useProfileSetup } from '@/hooks/useProfileSetup';
import Loading from '@/components/ui/loading';

const ProfileSetupPage: React.FC = () => {
  const { isLoading, userId, profileData, saveSuccess, handleProfileSaved } = useProfileSetup();
  
  if (isLoading) {
    return <Loading fullscreen text="Carregando perfil..." />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <ProfileSetupHeader saveSuccess={saveSuccess} />
        
        <Card className={`transition-all duration-300 ${saveSuccess ? 'border-green-500 shadow-md' : ''}`}>
          <ProfileSetupForm 
            userId={userId} 
            initialValues={profileData}
            onSaveSuccess={handleProfileSaved} 
          />
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
