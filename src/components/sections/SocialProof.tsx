
import React, { useState, useEffect } from 'react';
import { Users, FileText, Wrench } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

type StatProps = {
  icon: React.ReactNode;
  value: number;
  label: string;
  description: string;
};

const StatCard = ({ icon, value, label, description }: StatProps) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start > end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [inView, value]);
  
  return (
    <div 
      ref={ref}
      className="flex flex-col items-center p-8 bg-white rounded-lg shadow-md transform transition-all duration-500 hover:shadow-xl border border-gray-100"
    >
      <div className="text-oficina text-4xl mb-6">
        {icon}
      </div>
      <div className="text-4xl md:text-5xl font-bold text-oficina mb-3">
        +{count}
      </div>
      <h3 className="text-xl font-semibold text-oficina-dark mb-2">{label}</h3>
      <p className="text-oficina-gray text-center">{description}</p>
    </div>
  );
};

export default function SocialProof() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (inView) {
      setIsVisible(true);
    }
  }, [inView]);
  
  return (
    <section 
      ref={ref}
      className="py-24 bg-gray-50"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins text-oficina mb-4">
            Números que comprovam nossa eficiência
          </h2>
          <p className="text-lg text-oficina-gray max-w-2xl mx-auto">
            O OficinaÁgil está ajudando centenas de profissionais a transformar a gestão das suas oficinas.
          </p>
        </div>
        
        <div 
          className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          } transition-all duration-1000 ease-out`}
        >
          <StatCard
            icon={<Wrench size={48} />}
            value={100}
            label="Oficinas Ativas"
            description="Oficinas em todo o Brasil usando o OficinaÁgil diariamente."
          />
          <StatCard
            icon={<Users size={48} />}
            value={300}
            label="Usuários Cadastrados"
            description="Donos e funcionários trabalhando com mais eficiência e menos burocracia."
          />
          <StatCard
            icon={<FileText size={48} />}
            value={5000}
            label="Orçamentos Criados"
            description="Orçamentos profissionais que aumentam a taxa de aprovação dos clientes."
          />
        </div>
      </div>
    </section>
  );
}
