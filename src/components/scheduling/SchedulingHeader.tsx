
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarDays, ArrowLeft, Plus } from 'lucide-react';

const SchedulingHeader: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row justify-between mb-6">
      <div className="flex items-center mb-4 md:mb-0">
        <CalendarDays className="h-6 w-6 mr-2 text-oficina" />
        <h1 className="text-2xl font-bold">Novo Agendamento</h1>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center" 
          onClick={() => navigate('/agendamentos')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para agendamentos
        </Button>
      </div>
    </div>
  );
};

export default SchedulingHeader;
