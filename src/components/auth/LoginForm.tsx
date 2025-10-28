
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User, Lock, Eye, EyeOff } from "lucide-react";
import { sanitizeInput } from "@/utils/sanitize";
import { Checkbox } from "@/components/ui/checkbox";

export const loginFormSchema = z.object({
  email: z.string().email("Digite um email v�lido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  remember: z.boolean().optional().default(false),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: localStorage.getItem('remember_email') || "",
      password: "",
      remember: localStorage.getItem('remember_login') === 'true',
    },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    console.log('LoginForm: Bot�o Entrar clicado', { email: values.email });
    const sanitizedValues = {
      ...values,
      email: sanitizeInput(values.email),
    };
    console.log('LoginForm: Valores sanitizados, chamando onSubmit');
    try {
      if (sanitizedValues.remember) {
        localStorage.setItem('remember_email', sanitizedValues.email);
        localStorage.setItem('remember_login', 'true');
      } else {
        localStorage.removeItem('remember_email');
        localStorage.setItem('remember_login', 'false');
      }
      await onSubmit(sanitizedValues);
      console.log('LoginForm: onSubmit conclu�do com sucesso');
    } catch (error) {
      console.error('LoginForm: Erro durante onSubmit', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        console.log('LoginForm: Form onSubmit acionado');
        form.handleSubmit(handleSubmit)(e);
      }} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Digite seu email" 
                    type="email" 
                    className="pl-10"
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Digite sua senha" 
                    type={showPassword ? 'text' : 'password'} 
                    className="pl-10 pr-10"
                    {...field} 
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>Lembrar login</FormLabel>
              </FormItem>
            )}
          />
          <Link 
            to="/esqueceu-senha" 
            className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
          >
            Esqueceu sua senha?
          </Link>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
          onClick={() => {
            console.log('LoginForm: Bot�o Entrar clicado diretamente');
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Entrando...
            </>
          ) : (
            'Login'
          )}
        </Button>

        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">
            N�o tem uma conta?{' '}
            <Link 
              to="/register" 
              className="text-blue-600 hover:text-blue-500 hover:underline font-medium"
            >
              Registre-se
            </Link>
          </span>
        </div>
      </form>
    </Form>
  );
};

export default LoginForm;
