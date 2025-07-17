
import { Bot, Calendar, BarChart3, Users, Wrench, FileText, Shield, Smartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Features() {
  const features = [
    {
      icon: Bot,
      title: "IA para Diagnóstico",
      description: "Inteligência artificial avançada para identificar problemas mecânicos rapidamente",
      color: "text-emerald-600"
    },
    {
      icon: Calendar,
      title: "Agendamentos Inteligentes",
      description: "Sistema completo de agendamento com notificações automáticas",
      color: "text-blue-600"
    },
    {
      icon: BarChart3,
      title: "Relatórios Avançados",
      description: "Dashboard completo com métricas importantes do seu negócio",
      color: "text-purple-600"
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Cadastro completo de clientes com histórico de serviços",
      color: "text-orange-600"
    },
    {
      icon: Wrench,
      title: "Controle de Serviços",
      description: "Gerencie todos os serviços e peças da sua oficina",
      color: "text-red-600"
    },
    {
      icon: FileText,
      title: "Orçamentos Digitais",
      description: "Crie orçamentos profissionais em poucos cliques",
      color: "text-indigo-600"
    },
    {
      icon: Shield,
      title: "Backup Automático",
      description: "Seus dados sempre seguros na nuvem",
      color: "text-green-600"
    },
    {
      icon: Smartphone,
      title: "Acesso Mobile",
      description: "Acesse de qualquer lugar pelo celular ou tablet",
      color: "text-pink-600"
    }
  ];

  return (
    <section id="funcionalidades" className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Funcionalidades que <span className="text-blue-600">Transformam</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Descubra como o AutoFlow pode revolucionar a gestão da sua oficina com tecnologia de ponta
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-white">
              <CardHeader className="text-center pb-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 group-hover:from-blue-50 group-hover:to-blue-100 transition-all duration-300`}>
                  <feature.icon className={`h-8 w-8 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-blue-800 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <CardDescription className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
