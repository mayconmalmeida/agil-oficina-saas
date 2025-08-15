
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

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

    // Buscar admin na tabela admins - usando 'password' ao invés de 'password_hash'
    const { data: admin, error: adminError } = await supabaseClient
      .from('admins')
      .select('id, email, password, is_superadmin')
      .eq('email', email)
      .maybeSingle()

    if (adminError) {
      console.error('❌ Erro ao buscar admin:', adminError)
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!admin) {
      console.log('❌ Admin não encontrado para email:', email)
      return new Response(
        JSON.stringify({ error: 'Credenciais inválidas' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Admin encontrado:', { email: admin.email, id: admin.id })

    // Verificar senha usando bcrypt
    let passwordValid = false
    
    try {
      // Verificar se é um hash bcrypt válido
      const isBcryptHash = /^\$2[abxy]\$/.test(admin.password)
      
      if (isBcryptHash) {
        passwordValid = await bcrypt.compare(password, admin.password)
        console.log('🔒 Verificação bcrypt concluída:', passwordValid)
      } else {
        // Fallback para senhas em texto simples (temporário para migração)
        passwordValid = password === admin.password
        console.log('⚠️ Usando verificação de texto simples (deve ser migrado para bcrypt)')
      }
    } catch (bcryptError) {
      console.error('❌ Erro na verificação bcrypt:', bcryptError)
      return new Response(
        JSON.stringify({ error: 'Erro na validação da senha' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!passwordValid) {
      console.log('❌ Senha incorreta para admin:', email)
      return new Response(
        JSON.stringify({ error: 'Credenciais inválidas' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Gerar token de sessão
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 horas

    const adminUser = {
      id: admin.id,
      email: admin.email,
      role: admin.is_superadmin ? 'superadmin' : 'admin',
      isAdmin: true,
      canAccessFeatures: true,
      sessionToken,
      expiresAt: expiresAt.toISOString()
    }

    console.log('✅ Login admin bem-sucedido:', admin.email)

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
