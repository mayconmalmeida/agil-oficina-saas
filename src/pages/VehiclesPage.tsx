
import React from "react";

const VehiclesPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 px-2 sm:px-0">
          Veículos
        </h1>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 flex flex-col items-center justify-center">
          <p className="text-gray-700 text-lg mb-2">
            Aqui você poderá cadastrar e consultar os veículos dos clientes.
          </p>
          <span className="text-sm text-gray-500">
            Personalize esta tela conforme sua necessidade.
          </span>
        </div>
      </div>
    </div>
  );
};

export default VehiclesPage;
