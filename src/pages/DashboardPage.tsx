
import React from 'react';

const DashboardPage = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 px-2 sm:px-0">
          Dashboard
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-0">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Clientes</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Orçamentos</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Serviços</h3>
            <p className="text-2xl sm:text-3xl font-bold text-purple-600">0</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Produtos</h3>
            <p className="text-2xl sm:text-3xl font-bold text-orange-600">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
