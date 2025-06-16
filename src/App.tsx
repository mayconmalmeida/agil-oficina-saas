
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from '@/config/queryClient';
import RouteManager from '@/components/layout/RouteManager';
import AppRoutes from '@/components/app/AppRoutes';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <RouteManager>
          <AppRoutes />
          <Toaster />
        </RouteManager>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
