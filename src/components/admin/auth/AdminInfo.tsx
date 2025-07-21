
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const AdminInfo: React.FC = () => {
  return (
    <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="text-blue-800 dark:text-blue-200">
        <div className="space-y-2">
          <p className="font-medium">Como criar um administrador:</p>
          <p className="text-sm">
            Execute no SQL Editor do Supabase:
          </p>
          <code className="block bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded text-xs font-mono">
            UPDATE profiles SET role = 'admin' WHERE email = 'seu@email.com';
          </code>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default AdminInfo;
