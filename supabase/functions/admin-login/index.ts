
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password } = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email e senha são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('🔐 Tentativa de login admin para:', email)

    // Verificar se o usuário existe e tem role de admin na tabela profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, email, role')
      .eq('email', email)
      .maybeSingle()

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError)
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!profile) {
      console.log('❌ Perfil não encontrado para email:', email)
      return new Response(
        JSON.stringify({ error: 'Credenciais inválidas' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar se tem role de admin
    if (!profile.role || !['admin', 'superadmin'].includes(profile.role)) {
      console.log('❌ Usuário não é admin, role:', profile.role)
      return new Response(
        JSON.stringify({ error: 'Acesso negado: usuário não é administrador' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Tentar fazer login com Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.log('❌ Erro de autenticação:', authError.message)
      return new Response(
        JSON.stringify({ error: 'Credenciais inválidas' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!authData.user) {
      console.log('❌ Dados do usuário não encontrados')
      return new Response(
        JSON.stringify({ error: 'Erro na autenticação' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Admin encontrado:', { email: profile.email, id: profile.id })

    // Gerar token de sessão
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 horas

    const adminUser = {
      id: profile.id,
      email: profile.email,
      role: profile.role === 'superadmin' ? 'superadmin' : 'admin',
      isAdmin: true,
      canAccessFeatures: true,
      sessionToken,
      expiresAt: expiresAt.toISOString()
    }

    console.log('✅ Login admin bem-sucedido:', profile.email)

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: adminUser,
        message: 'Login realizado com sucesso'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 Erro no login admin:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
