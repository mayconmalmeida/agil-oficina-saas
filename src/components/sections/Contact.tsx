
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulação de envio
    setTimeout(() => {
      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <section id="contato" className="py-20 bg-oficina-lightgray">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="lg:w-1/2 p-8 md:p-12 bg-oficina text-white">
              <h2 className="text-3xl font-bold mb-6">Entre em Contato</h2>
              <p className="mb-8">
                Estamos aqui para ajudar você a transformar a gestão da sua oficina. 
                Preencha o formulário e nossa equipe entrará em contato o mais rápido possível.
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">E-mail</h3>
                  <p>contato@oficinaagil.com.br</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Telefone</h3>
                  <p>(XX) XXXX-XXXX</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Horário de Atendimento</h3>
                  <p>Seg - Sex: 8h às 18h</p>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-oficina-dark mb-1">
                    Nome completo
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome"
                    required
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-oficina-dark mb-1">
                    E-mail
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-oficina-dark mb-1">
                    Telefone
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(XX) XXXXX-XXXX"
                    required
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-oficina-dark mb-1">
                    Mensagem
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Como podemos ajudar você?"
                    required
                    rows={4}
                    className="w-full resize-none"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-oficina-accent hover:bg-orange-600 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
