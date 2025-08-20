
"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Planos que Cabem no seu Bolso",
  description = "Escolha o plano ideal para sua oficina. Comece grátis e evolua conforme seu negócio cresce.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "#3B82F6",
          "#1E40AF",
          "#60A5FA",
          "#DBEAFE",
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  const formatPrice = (price: string) => {
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="container py-20">
      <div className="text-center space-y-4 mb-12">
        <motion.h2 
          className="text-4xl font-bold tracking-tight sm:text-5xl text-gray-900"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {title}
        </motion.h2>
        <motion.p 
          className="text-gray-600 text-lg whitespace-pre-line max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {description}
        </motion.p>
      </div>

      <motion.div 
        className="flex justify-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center space-x-3 bg-gray-100 p-1 rounded-lg">
          <span className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
            isMonthly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
          }`}>
            Mensal
          </span>
          <Label>
            <Switch
              ref={switchRef as any}
              checked={!isMonthly}
              onCheckedChange={handleToggle}
              className="relative"
            />
          </Label>
          <span className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
            !isMonthly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
          }`}>
            Anual <span className="text-green-600 text-xs ml-1">-17%</span>
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ 
              y: -10,
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: index * 0.1,
            }}
            className={cn(
              `relative rounded-2xl border p-8 bg-white text-center shadow-lg hover:shadow-2xl transition-all duration-300`,
              plan.isPopular ? "border-2 border-blue-500 scale-105" : "border border-gray-200",
              "flex flex-col h-full"
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-2 rounded-t-2xl">
                <div className="flex items-center justify-center space-x-1">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-semibold">MAIS ECONÔMICO</span>
                  <Star className="h-4 w-4 fill-current" />
                </div>
              </div>
            )}
            
            <div className={`flex-1 flex flex-col ${plan.isPopular ? 'pt-8' : 'pt-2'}`}>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              
              <div className="flex items-center justify-center space-x-1 mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  R$ {formatPrice(isMonthly ? plan.price : plan.yearlyPrice)}
                </span>
                <span className="text-lg text-gray-600">
                  {isMonthly ? "/mês" : "/ano"}
                </span>
              </div>

              {!isMonthly && (
                <div className="text-sm text-green-600 font-medium mb-4">
                  Economize 17% no plano anual
                </div>
              )}

              <p className="text-gray-600 mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 text-left">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.href}
                className={cn(
                  "w-full py-3 px-6 rounded-lg font-semibold text-base transition-all duration-300 transform hover:scale-105",
                  plan.isPopular
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300"
                )}
              >
                {plan.buttonText}
              </Link>
              
              <p className="text-center text-xs text-gray-500 mt-3">
                7 dias grátis • Sem cartão de crédito
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
