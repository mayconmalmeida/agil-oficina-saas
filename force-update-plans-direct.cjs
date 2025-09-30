const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzI2NjQ1MCwiZXhwIjoyMDYyODQyNDUwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function forceUpdatePlans() {
  console.log('🔧 Forçando atualização direta dos planos...\n');

  try {
    // Primeiro, vamos ver os planos atuais
    console.log('--- Estado atual dos planos ---');
    const { data: currentPlans, error: fetchError } = await supabase
      .from('plan_configurations')
      .select('*')
      .order('id');

    if (fetchError) {
      console.error('❌ Erro ao buscar planos:', fetchError);
      return;
    }

    console.log(`Encontrados ${currentPlans.length} planos:`);
    currentPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name} - R$ ${plan.price} (${plan.billing_cycle})`);
    });

    if (currentPlans.length < 2) {
      console.error('❌ Menos de 2 planos encontrados');
      return;
    }

    // Usar SQL direto para forçar a atualização
    console.log('\n--- Executando SQL direto ---');
    
    // Atualizar plano mensal (primeiro plano)
    const { data: monthlyUpdate, error: monthlyError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE plan_configurations 
        SET 
          name = 'Essencial Mensal',
          price = 197.90,
          affiliate_link = 'https://checkout.cackto.com.br/essencial/mensal',
          features = '["Gestão básica de clientes", "Orçamentos ilimitados", "Controle de estoque", "Relatórios básicos", "Suporte por email"]',
          updated_at = NOW()
        WHERE id = $1
        RETURNING *;
      `,
      params: [currentPlans[0].id]
    });

    if (monthlyError) {
      console.log('❌ Erro SQL mensal:', monthlyError);
      
      // Tentar abordagem alternativa
      console.log('Tentando abordagem alternativa para plano mensal...');
      const { data: altMonthly, error: altMonthlyError } = await supabase
        .from('plan_configurations')
        .update({
          name: 'Essencial Mensal',
          price: 197.90,
          affiliate_link: 'https://checkout.cackto.com.br/essencial/mensal',
          features: ["Gestão básica de clientes", "Orçamentos ilimitados", "Controle de estoque", "Relatórios básicos", "Suporte por email"],
          updated_at: new Date().toISOString()
        })
        .eq('id', currentPlans[0].id)
        .select();

      if (altMonthlyError) {
        console.error('❌ Erro alternativo mensal:', altMonthlyError);
      } else {
        console.log('✅ Plano mensal atualizado (alternativo)');
      }
    } else {
      console.log('✅ Plano mensal atualizado (SQL direto)');
    }

    // Atualizar plano anual (segundo plano)
    const { data: annualUpdate, error: annualError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE plan_configurations 
        SET 
          name = 'Premium Anual',
          price = 1970.00,
          affiliate_link = 'https://checkout.cackto.com.br/premium/anual',
          features = '["Tudo do plano mensal", "Relatórios avançados", "Integração com WhatsApp", "Backup automático", "Suporte prioritário", "Múltiplos usuários"]',
          updated_at = NOW()
        WHERE id = $1
        RETURNING *;
      `,
      params: [currentPlans[1].id]
    });

    if (annualError) {
      console.log('❌ Erro SQL anual:', annualError);
      
      // Tentar abordagem alternativa
      console.log('Tentando abordagem alternativa para plano anual...');
      const { data: altAnnual, error: altAnnualError } = await supabase
        .from('plan_configurations')
        .update({
          name: 'Premium Anual',
          price: 1970.00,
          affiliate_link: 'https://checkout.cackto.com.br/premium/anual',
          features: ["Tudo do plano mensal", "Relatórios avançados", "Integração com WhatsApp", "Backup automático", "Suporte prioritário", "Múltiplos usuários"],
          updated_at: new Date().toISOString()
        })
        .eq('id', currentPlans[1].id)
        .select();

      if (altAnnualError) {
        console.error('❌ Erro alternativo anual:', altAnnualError);
      } else {
        console.log('✅ Plano anual atualizado (alternativo)');
      }
    } else {
      console.log('✅ Plano anual atualizado (SQL direto)');
    }

    // Aguardar e verificar
    console.log('\nAguardando 5 segundos para cache atualizar...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verificação final com nova conexão
    console.log('\n--- Verificação final (nova consulta) ---');
    const { data: finalPlans, error: finalError } = await supabase
      .from('plan_configurations')
      .select('*')
      .order('id');

    if (finalError) {
      console.error('❌ Erro na verificação final:', finalError);
      return;
    }

    console.log('Planos após atualização forçada:\n');
    finalPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name}`);
      console.log(`   Tipo: ${plan.plan_type}`);
      console.log(`   Preço: R$ ${plan.price}`);
      console.log(`   Ciclo: ${plan.billing_cycle}`);
      console.log(`   Link: ${plan.affiliate_link}`);
      console.log(`   Ativo: ${plan.is_active}`);
      console.log(`   Atualizado: ${plan.updated_at}`);
      console.log('');
    });

    // Resumo final
    console.log('--- Resumo das atualizações forçadas ---');
    const monthlyPlan = finalPlans[0];
    const annualPlan = finalPlans[1];

    if (monthlyPlan.price == 197.90) {
      console.log('✅ Plano mensal: Preço correto R$ 197,90');
    } else {
      console.log(`❌ Plano mensal: Preço ainda é R$ ${monthlyPlan.price}`);
    }

    if (annualPlan.price == 1970.00) {
      console.log('✅ Plano anual: Preço correto R$ 1.970,00');
    } else {
      console.log(`❌ Plano anual: Preço ainda é R$ ${annualPlan.price}`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

forceUpdatePlans();