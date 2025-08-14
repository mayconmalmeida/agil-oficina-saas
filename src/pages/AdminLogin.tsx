
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/lib/supabase';
import { AlertTriangle, Loader2 } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const navigate = useNavigate();

  // Verificar conexão com Supabase
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('checking');
        console.log("[AdminLogin] 🔍 Verificando conexão com Supabase...");
        
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error) {
          console.error("[AdminLogin] ❌ Falha na conexão:", error);
          setConnectionStatus('error');
          setError(`Erro de conexão: ${error.message}`);
        } else {
          console.log("[AdminLogin] ✅ Conexão estabelecida");
          setConnectionStatus('connected');
          setError(null);
        }
      } catch (error) {
        console.error("[AdminLogin] 💥 Erro ao verificar conexão:", error);
        setConnectionStatus('error');
        setError("Erro ao conectar com o servidor");
      }
    };
    
    checkConnection();

    // Verificar se já está logado como admin
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log("[AdminLogin] Verificando sessão existente para userId:", session.user.id);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profile?.role === 'admin' || profile?.role === 'superadmin') {
          console.log("[AdminLogin] Admin já logado, redirecionando... userId:", session.user.id);
          navigate('/admin');
        }
      }
    };
    
    checkExistingSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (connectionStatus !== 'connected') {
      setError("Não é possível fazer login sem conexão com o servidor");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("[AdminLogin] 🔐 Tentando login admin com tabela admins...");
      
      // Buscar admin na tabela admins
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('id, email, password, is_superadmin')
        .eq('email', email)
        .maybeSingle();

      if (adminError) {
        console.error("[AdminLogin] ❌ Erro ao buscar admin:", adminError);
        throw new Error("Erro ao verificar credenciais");
      }

      if (!admin) {
        console.log("[AdminLogin] ❌ Admin não encontrado para email:", email);
        throw new Error("Email não encontrado no sistema de administração");
      }

      console.log("[AdminLogin] ✅ Admin encontrado:", {
        email: admin.email,
        id: admin.id,
        is_superadmin: admin.is_superadmin
      });

      // Verificar senha (assumindo que está em texto simples na tabela)
      if (password !== admin.password) {
        console.log("[AdminLogin] ❌ Senha incorreta");
        throw new Error("Senha incorreta");
      }

      console.log("[AdminLogin] ✅ Senha validada");

      // Criar/atualizar perfil admin na tabela profiles
      const adminRole = admin.is_superadmin ? 'superadmin' : 'admin';
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: admin.id,
          email: admin.email,
          role: adminRole,
          is_active: true,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error("[AdminLogin] ❌ Erro ao criar perfil admin:", profileError);
      } else {
        console.log("[AdminLogin] ✅ Perfil admin criado/atualizado");
      }

      // Tentar autenticação Supabase (opcional)
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (!authError && authData.session) {
          console.log("[AdminLogin] ✅ Autenticação Supabase bem-sucedida");
        } else {
          console.log("[AdminLogin] ⚠️ Autenticação Supabase falhou, mas prosseguindo com login admin");
        }
      } catch (authAttemptError) {
        console.log("[AdminLogin] ⚠️ Erro na autenticação Supabase, mas prosseguindo");
      }

      console.log("[AdminLogin] ➡️ Redirecionando para dashboard admin");
      navigate('/admin');

    } catch (err: any) {
      console.error("[AdminLogin] 💥 Erro no login admin:", err);
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'checking': return 'text-yellow-600';
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'checking': return 'Verificando conexão...';
      case 'connected': return 'Conexão estabelecida';
      case 'error': return 'Erro de conexão';
      default: return 'Status desconhecido';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8">
        <Card className="shadow-lg border-t-4 border-t-blue-600">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais de administrador
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Status da Conexão */}
            <div className={`flex items-center space-x-2 text-sm ${getConnectionStatusColor()}`}>
              {connectionStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{getConnectionStatusText()}</span>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Informação sobre Admin */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Sistema Admin</span>
              </div>
              <p className="text-xs text-blue-700">
                Login de administradores usando a tabela 'admins'. 
                Credenciais devem estar cadastradas nesta tabela.
              </p>
            </div>

            {/* Formulário de Login */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@empresa.com"
                  required
                  disabled={loading || connectionStatus !== 'connected'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading || connectionStatus !== 'connected'}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading || connectionStatus !== 'connected'}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar como Admin'
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center flex-col space-y-2">
            <Button
              variant="link"
              onClick={() => navigate("/")}
              disabled={loading}
            >
              Voltar para a página inicial
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
