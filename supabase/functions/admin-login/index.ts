
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

    // Usar a função validate_admin_login para autenticar
    const { data: loginResult, error: loginError } = await supabaseClient
      .rpc('validate_admin_login', {
        p_email: email,
        p_password: password
      })

    if (loginError) {
      console.error('❌ Erro na função de login:', loginError)
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!loginResult.success) {
      console.log('❌ Login rejeitado:', loginResult.error)
      return new Response(
        JSON.stringify({ error: loginResult.error }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const adminData = loginResult.admin
    console.log('✅ Admin encontrado:', { email: adminData.email, id: adminData.id })

    // Gerar token de sessão
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 horas

    const adminUser = {
      id: adminData.id,
      email: adminData.email,
      role: adminData.role === 'superadmin' ? 'superadmin' : 'admin',
      isAdmin: true,
      canAccessFeatures: true,
      sessionToken,
      expiresAt: expiresAt.toISOString()
    }

    console.log('✅ Login admin bem-sucedido:', adminData.email)

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
