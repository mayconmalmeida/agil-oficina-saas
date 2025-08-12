
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardMainContent: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <main className={`
      flex-1 relative z-0 overflow-y-auto focus:outline-none
      ${isMobile ? 'px-3 py-4' : 'px-6 py-8'}
    `}>
      <div className={`
        mx-auto 
        ${isMobile ? 'max-w-full' : 'max-w-7xl'}
      `}>
        <Outlet />
      </div>
    </main>
  );
};

export default DashboardMainContent;
