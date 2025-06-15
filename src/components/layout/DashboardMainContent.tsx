
import React from "react";
import { Outlet } from "react-router-dom";

interface DashboardMainContentProps {}

const DashboardMainContent: React.FC<DashboardMainContentProps> = () => {
  return (
    <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
      <div className="min-h-full">
        <Outlet />
      </div>
    </main>
  );
};

export default DashboardMainContent;
