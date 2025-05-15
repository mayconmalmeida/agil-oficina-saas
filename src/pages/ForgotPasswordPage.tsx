
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Digite um email válido")
});

type FormValues = z.infer<typeof formSchema>;

const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ""
    }
  });
  
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: window.location.origin + '/redefinir-senha',
      });
      
      if (error) {
        console.error("Erro ao solicitar redefinição de senha:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível enviar o email de redefinição de senha."
        });
      } else {
        setIsSuccess(true);
        toast({
          title: "Email enviado",
          description: "Verifique sua caixa de entrada para redefinir sua senha."
        });
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao processar sua solicitação."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/" className="text-2xl font-bold text-oficina-dark">
            Oficina<span className="text-oficina-accent">Ágil</span>
          </Link>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isSuccess ? "Email enviado" : "Esqueceu sua senha?"}
            </CardTitle>
            <CardDescription className="text-center">
              {isSuccess 
                ? "Verifique seu email para instruções de redefinição de senha" 
                : "Digite seu email para receber um link de redefinição de senha"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isSuccess ? (
              <div className="text-center py-4">
                <p className="mb-4">
                  Enviamos um link para redefinir sua senha. Por favor, verifique sua caixa de entrada.
                </p>
                <p className="text-sm text-gray-500">
                  Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="exemplo@oficina.com" 
                            type="email" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Enviando...
                      </>
                    ) : (
                      'Enviar link de redefinição'
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Link 
              to="/login" 
              className="text-center w-full text-sm text-oficina hover:underline flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
