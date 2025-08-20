
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  FileText, 
  BarChart3, 
  Smartphone, 
  Shield, 
  Clock, 
  Star,
  Check,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Wrench,
  DollarSign,
  Bot,
  Zap,
  Target,
  TrendingUp,
  Award,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Pricing } from '@/components/ui/pricing';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Dados dos planos para o novo componente
  const pricingPlans = [
    {
      name: "Premium Mensal",
      price: "197",
      yearlyPrice: "1970",
      period: "mês",
      features: [
        "Gestão completa de clientes",
        "Orçamentos digitais profissionais",
        "IA para diagnóstico avançado",
        "Agendamentos inteligentes",
        "Controle de estoque completo",
        "Relatórios avançados",
        "Marketing automático",
        "Suporte prioritário",
        "Integração contábil",
        "App mobile",
        "Backup automático"
      ],
      description: "Gestão completa para sua oficina",
      buttonText: "Começar Teste Grátis",
      href: "/register",
      isPopular: false,
    },
    {
      name: "Premium Anual",
      price: "197",
      yearlyPrice: "1970",
      period: "ano",
      features: [
        "Tudo do Premium Mensal",
        "2 meses grátis no plano anual", 
        "Desconto especial de 17%",
        "Suporte prioritário garantido",
        "Treinamento personalizado",
        "Migração gratuita de dados",
        "Customizações exclusivas"
      ],
      description: "R$ 1.970,00/ano - Economia de 17%",
      buttonText: "Começar Teste Grátis",
      href: "/register",
      isPopular: true,
    }
  ];

  const features = [
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Agendamento Inteligente",
      description: "Organize sua agenda com facilidade e nunca perca um compromisso importante."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Gestão de Clientes",
      description: "Mantenha todas as informações dos seus clientes organizadas em um só lugar."
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Orçamentos Digitais",
      description: "Crie orçamentos profissionais em minutos e impressione seus clientes."
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Relatórios Avançados",
      description: "Acompanhe o desempenho do seu negócio com relatórios detalhados."
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Acesso Mobile",
      description: "Gerencie sua oficina de qualquer lugar com nosso app mobile."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Dados Seguros",
      description: "Seus dados protegidos com a mais alta tecnologia de segurança."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Cadastre-se Grátis",
      description: "Crie sua conta em menos de 2 minutos"
    },
    {
      number: "02", 
      title: "Configure sua Oficina",
      description: "Adicione informações básicas do seu negócio"
    },
    {
      number: "03",
      title: "Comece a Usar",
      description: "Aproveite todos os recursos imediatamente"
    }
  ];

  const faqs = [
    {
      question: "Como funciona o período de teste gratuito?",
      answer: "Você tem 7 dias para testar todas as funcionalidades gratuitamente, sem compromisso e sem precisar informar cartão de crédito."
    },
    {
      question: "Posso cancelar minha assinatura a qualquer momento?",
      answer: "Sim! Você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais."
    },
    {
      question: "Meus dados ficam seguros?",
      answer: "Absolutamente! Utilizamos criptografia de ponta e servidores seguros para proteger todas as suas informações."
    },
    {
      question: "Preciso instalar algum software?",
      answer: "Não! O Oficina Go funciona 100% online. Basta acessar pelo navegador de qualquer dispositivo."
    },
    {
      question: "Vocês oferecem suporte técnico?",
      answer: "Sim! Oferecemos suporte técnico completo via WhatsApp, email e chat para todos os nossos clientes."
    },
    {
      question: "Como migrar meus dados atuais?",
      answer: "Nossa equipe te ajuda gratuitamente na migração dos seus dados. É um processo simples e rápido."
    }
  ];

  // Componente para números animados
  const AnimatedCounter = ({ end, duration = 2000, prefix = "", suffix = "" }: { 
    end: number; 
    duration?: number; 
    prefix?: string; 
    suffix?: string; 
  }) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);

    React.useEffect(() => {
      if (hasAnimated) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setHasAnimated(true);
            let startTime: number;
            const animate = (currentTime: number) => {
              if (!startTime) startTime = currentTime;
              const progress = Math.min((currentTime - startTime) / duration, 1);
              setCount(Math.floor(progress * end));
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };
            requestAnimationFrame(animate);
          }
        },
        { threshold: 0.5 }
      );

      const element = document.getElementById(`counter-${end}`);
      if (element) observer.observe(element);

      return () => observer.disconnect();
    }, [end, duration, hasAnimated]);

    return (
      <span id={`counter-${end}`}>
        {prefix}{count.toLocaleString('pt-BR')}{suffix}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">Oficina Go</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#funcionalidades" className="text-gray-600 hover:text-blue-600 transition-colors">
                Funcionalidades
              </a>
              <a href="#precos" className="text-gray-600 hover:text-blue-600 transition-colors">
                Preços
              </a>
              <a href="#contato" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contato
              </a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                Entrar
              </Link>
              <Link to="/register">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Teste Grátis
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.div 
              className="md:hidden py-4 border-t"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <nav className="flex flex-col space-y-4">
                <a href="#funcionalidades" className="text-gray-600 hover:text-blue-600">
                  Funcionalidades
                </a>
                <a href="#precos" className="text-gray-600 hover:text-blue-600">
                  Preços
                </a>
                <a href="#contato" className="text-gray-600 hover:text-blue-600">
                  Contato
                </a>
                <Link to="/login" className="text-gray-600 hover:text-blue-600">
                  Entrar
                </Link>
                <Link to="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700 w-full">
                    Teste Grátis
                  </Button>
                </Link>
              </nav>
            </motion.div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Transforme a gestão da sua oficina com o{' '}
              <span className="text-blue-600">Oficina Go</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Sistema completo para gerenciar clientes, orçamentos, agendamentos e muito mais. 
              Tudo online, fácil e intuitivo.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link to="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                  Começar Teste Grátis
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Ver Demonstração
              </Button>
            </motion.div>

            <motion.p 
              className="text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              ✅ 7 dias grátis • ✅ Sem cartão de crédito • ✅ Suporte incluído
            </motion.p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Números que comprovam nossa eficiência
            </h2>
            <p className="text-lg text-gray-600">
              Milhares de oficinas já confiam no Oficina Go
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="text-4xl font-bold text-blue-600 mb-2">
                <AnimatedCounter end={1250} suffix="+" />
              </div>
              <p className="text-lg text-gray-600">Oficinas Ativas</p>
            </motion.div>

            <motion.div 
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-4xl font-bold text-blue-600 mb-2">
                <AnimatedCounter end={85000} suffix="+" />
              </div>
              <p className="text-lg text-gray-600">Usuários Cadastrados</p>
            </motion.div>

            <motion.div 
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-4xl font-bold text-blue-600 mb-2">
                <AnimatedCounter end={2500000} suffix="+" />
              </div>
              <p className="text-lg text-gray-600">Orçamentos Criados</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tudo que sua oficina precisa em um só lugar
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Recursos completos para automatizar e otimizar todos os processos da sua oficina
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="hover-scale"
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="text-blue-600 mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                IA para Diagnóstico de Problemas Mecânicos
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Nossa inteligência artificial ajuda você a diagnosticar problemas de forma mais rápida e precisa, 
                aumentando a eficiência do seu atendimento.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Diagnósticos mais precisos</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Redução do tempo de análise</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Sugestões de soluções automáticas</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-8">
                <Bot className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">IA Diagnóstico</h3>
                  <p className="text-gray-600">Tecnologia avançada para sua oficina</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1 relative"
            >
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-8">
                <Zap className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">IA Suporte</h3>
                  <p className="text-gray-600">Assistente inteligente 24/7</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                IA para Suporte Inteligente no Sistema
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Assistente virtual disponível 24 horas para tirar suas dúvidas e ajudar você a 
                usar todas as funcionalidades do sistema.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Suporte 24/7 automatizado</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Respostas instantâneas</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Treinamento personalizado</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Começar a usar o Oficina Go é simples e rápido. Siga estes passos:
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-16 bg-white">
        <Pricing plans={pricingPlans} />
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tire suas dúvidas sobre o Oficina Go
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="mb-4"
              >
                <Card>
                  <CardContent className="p-0">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900">{faq.question}</span>
                      <ChevronDown 
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          openFaq === index ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    {openFaq === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 pb-6"
                      >
                        <p className="text-gray-600">{faq.answer}</p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Entre em Contato
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Tem dúvidas? Nossa equipe está pronta para ajudar você a revolucionar sua oficina.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">(46) 9 9932-4779</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">contatooficinago@gmail.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">Brasil</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardContent className="p-6">
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo
                      </label>
                      <Input placeholder="Seu nome completo" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input type="email" placeholder="seu@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone
                      </label>
                      <Input placeholder="(00) 00000-0000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensagem
                      </label>
                      <Textarea placeholder="Como podemos ajudar você?" rows={4} />
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Enviar Mensagem
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Wrench className="h-8 w-8 text-blue-400 mr-2" />
                <span className="text-2xl font-bold">Oficina Go</span>
              </div>
              <p className="text-gray-400">
                Sistema completo para gestão de oficinas mecânicas. 
                Simplifique seu negócio e aumente seus resultados.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#precos" className="hover:text-white transition-colors">Preços</a></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Teste Grátis</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#contato" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreira</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Oficina Go. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
