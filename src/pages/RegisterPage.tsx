
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Label } from '@/components/ui/label';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nomeOficina, setNomeOficina] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Email é obrigatório."
      });
      return false;
    }

    if (!email.includes('@')) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite um email válido."
      });
      return false;
    }

    if (!password) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Senha é obrigatória."
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres."
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem."
      });
      return false;
    }

    if (!nomeOficina.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome da oficina é obrigatório."
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Registrar usuário
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nome_oficina: nomeOficina.trim()
          }
        }
      });

      if (error) {
        console.error('Erro no registro:', error);
        throw error;
      }

      if (data.user) {
        // Iniciar trial Premium automaticamente após registro
        const { error: trialError } = await supabase.rpc('start_free_trial', {
          p_user_id: data.user.id,
          p_plan_type: 'premium' // Sempre Premium agora
        });

        if (trialError) {
          console.error('Erro ao iniciar trial:', trialError);
          // Não falhar o registro se o trial der erro
        }

        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar sua conta. Seu teste Premium de 7 dias foi ativado automaticamente."
        });

        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      let errorMessage = "Erro ao criar conta. Tente novamente.";
      
      if (error.message?.includes('already registered')) {
        errorMessage = "Este email já está cadastrado.";
      } else if (error.message?.includes('invalid email')) {
        errorMessage = "Email inválido.";
      } else if (error.message?.includes('weak password')) {
        errorMessage = "Senha muito fraca. Use pelo menos 6 caracteres.";
      }

      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
          <CardDescription className="text-center">
            Cadastre-se e ganhe 7 dias Premium grátis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeOficina">Nome da Oficina</Label>
              <Input
                id="nomeOficina"
                type="text"
                placeholder="Ex: Auto Center Silva"
                value={nomeOficina}
                onChange={(e) => setNomeOficina(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta Grátis'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Link to="/login" className="text-primary hover:underline">
              Fazer login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
