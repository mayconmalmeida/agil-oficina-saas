import React, { useState, useEffect } from 'react';
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
  CheckCircle,
  ArrowRight,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Pricing } from '@/components/ui/pricing';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showDemo, setShowDemo] = useState(false);

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
        "Suporte prioritário",
        "Integração contábil",
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

  const AnimatedCounter = ({ end, duration = 2000, prefix = "", suffix = "" }: { 
    end: number; 
    duration?: number; 
    prefix?: string; 
    suffix?: string; 
  }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      if (!isVisible) return;

      let startTime: number;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing function for smoother animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * end));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, isVisible]);

    return (
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ 
          scale: 1, 
          opacity: 1,
          transition: { 
            duration: 0.5,
            type: "spring",
            stiffness: 100
          }
        }}
        viewport={{ once: true }}
        onViewportEnter={() => setIsVisible(true)}
        className="inline-block"
      >
        {prefix}{count.toLocaleString()}{suffix}
      </motion.span>
    );
  };

  return (
    <div className="min-h-screen bg-white transition-colors duration-300">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Wrench className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Oficina Go</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                Recursos
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                Preços
              </a>
              <a href="#faq" className="text-gray-600 hover:text-blue-600 transition-colors">
                FAQ
              </a>
              <a href="#contato" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contato
              </a>
              <Link to="/login">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Entrar
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Começar Grátis
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4"
            >
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Recursos
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Preços
                </a>
                <a href="#faq" className="text-gray-600 hover:text-blue-600 transition-colors">
                  FAQ
                </a>
                <a href="#contato" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Contato
                </a>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Tema
                  </span>
                </div>
                <div className="flex flex-col space-y-2 pt-2">
                  <Link to="/login">
                    <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Começar Grátis
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Gerencie sua oficina com
              <span className="text-blue-600"> inteligência</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Sistema completo para gestão de oficinas mecânicas. Controle de serviços, 
              estoque, clientes e muito mais em uma plataforma moderna e intuitiva.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link to="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  Começar Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Números que comprovam nossa eficiência
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Resultados reais de oficinas que confiam no Oficina Go
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-3">
                <AnimatedCounter end={100} suffix="+" />
              </div>
              <p className="text-gray-600 font-medium">Oficinas Ativas</p>
              <div className="mt-4 w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-3">
                <AnimatedCounter end={300} suffix="+" />
              </div>
              <p className="text-gray-600 font-medium">Usuários Cadastrados</p>
              <div className="mt-4 w-16 h-1 bg-green-600 mx-auto rounded-full"></div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-3">
                <AnimatedCounter end={5000} suffix="+" />
              </div>
              <p className="text-gray-600 font-medium">Orçamentos Criados</p>
              <div className="mt-4 w-16 h-1 bg-purple-600 mx-auto rounded-full"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recursos que fazem a diferença
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tudo que você precisa para gerenciar sua oficina de forma eficiente e profissional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Oil Change Label Highlight Section */}
      <section className="py-16 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-b border-amber-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                <FileText className="h-8 w-8 text-amber-600" />
              </div>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Wrench className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              🏷️ Destaque Especial: Gerar Etiqueta
            </h2>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-amber-200">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  IMPORTANTE
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Etiquetas de Troca de Óleo - Essencial para sua Oficina
              </h3>
              
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                O menu <strong>"Gerar Etiqueta"</strong> é uma funcionalidade fundamental do sistema. 
                A geração de etiquetas para troca de óleo é <strong>extremamente importante</strong> para:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Controle de Manutenção</h4>
                    <p className="text-gray-600">Acompanhe quando foi realizada a última troca de óleo</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Fidelização do Cliente</h4>
                    <p className="text-gray-600">Lembre o cliente sobre a próxima manutenção necessária</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Profissionalismo</h4>
                    <p className="text-gray-600">Demonstre organização e cuidado com o veículo</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Histórico Completo</h4>
                    <p className="text-gray-600">Mantenha registro detalhado de todas as manutenções</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-amber-800 font-medium text-center">
                  💡 <strong>Dica:</strong> Use as etiquetas para criar um diferencial competitivo e aumentar a confiança dos seus clientes!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>



      {/* AI Support Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Bot className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                IA para Diagnóstico de Problemas Mecânicos
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Nossa inteligência artificial ajuda você a diagnosticar problemas de 
                forma mais rápida e precisa, aumentando a eficiência do seu 
                atendimento.
              </p>
              <ul className="space-y-4">
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
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
                <img 
                  src="/ia-diagnostico.svg" 
                  alt="IA Diagnóstico" 
                  className="rounded-lg w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8">
                <img 
                  src="/ia-suporte.svg" 
                  alt="IA Suporte" 
                  className="rounded-lg w-full h-auto"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                IA para Suporte Inteligente no Sistema
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Assistente virtual disponível 24 horas para tirar suas dúvidas e ajudar 
                você a usar todas as funcionalidades do sistema.
              </p>
              <ul className="space-y-4">
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
      <section id="faq" className="py-16 bg-gray-50">
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
                  <div className="text-gray-700">
                    <div>Pato Branco - PR</div>
                    <div>Brasil</div>
                  </div>
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
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Wrench className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold ml-2">Oficina Go</span>
              </div>
              <p className="text-gray-400">
                Sistema completo para gestão de oficinas mecânicas.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Produto</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrações</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#contato" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentação</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2024 Oficina Go. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacidade
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Termos
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
