
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

type ErrorDisplayProps = {
  message: string | null;
};

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default ErrorDisplay;
