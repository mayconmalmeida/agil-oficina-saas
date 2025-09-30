import React from 'react';

interface AdminSubscriptionsErrorProps {
  error: string;
  onRetry: () => void;
}

const AdminSubscriptionsError = ({ error, onRetry }: AdminSubscriptionsErrorProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="bg-white shadow rounded-lg p-6 max-w-xl w-full">
        <h2 className="text-lg font-bold mb-2 text-red-700">Erro ao carregar assinaturas:</h2>
        <p className="mb-3 text-gray-700">{error}</p>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={onRetry}
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );
};

export default AdminSubscriptionsError;
