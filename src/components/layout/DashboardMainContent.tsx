
import React from 'react';
import { Outlet } from 'react-router-dom';

const DashboardMainContent: React.FC = () => {
  return (
    <main className="flex-1 overflow-auto bg-gray-50 min-h-0">
      <div className="h-full">
        <Outlet />
      </div>
    </main>
  );
};

export default DashboardMainContent;
