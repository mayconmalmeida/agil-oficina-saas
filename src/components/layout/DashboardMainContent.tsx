
import React from 'react';
import { Outlet } from 'react-router-dom';

const DashboardMainContent: React.FC = () => {
  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <Outlet />
      </div>
    </main>
  );
};

export default DashboardMainContent;
