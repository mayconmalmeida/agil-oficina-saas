const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function simplePlanUpdate() {
  try {
    console.log('🔧 Atualização simples dos planos...\n');
    
    // Buscar planos existentes
    const { data: existingPlans, error: fetchError } = await supabase
      .from('plan_configurations')
      .select('*')
      .order('id');
    
    if (fetchError) {
      console.error('❌ Erro ao buscar planos:', fetchError);
      return;
    }

    console.log(`Encontrados ${existingPlans.length} planos:`);
    existingPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ID: ${plan.id} - ${plan.name} - R$ ${plan.price}`);
    });

    if (existingPlans.length < 2) {
      console.error('❌ Menos de 2 planos encontrados');
      return;
    }

    // Tentar diferentes abordagens de atualização
    console.log('\n--- Tentativa 1: Atualização direta ---');
    
    // Atualizar primeiro plano (mensal)
    const { data: monthlyResult, error: monthlyError } = await supabase
      .from('plan_configurations')
      .update({
        name: 'Essencial Mensal',
        price: 197.90,
        affiliate_link: 'https://checkout.cackto.com.br/essencial/mensal'
      })
      .eq('id', existingPlans[0].id)
      .select();

    if (monthlyError) {
      console.log('❌ Erro ao atualizar plano mensal:', monthlyError.message);
    } else {
      console.log('✅ Plano mensal atualizado');
    }

    // Atualizar segundo plano (anual)
    const { data: annualResult, error: annualError } = await supabase
      .from('plan_configurations')
      .update({
        name: 'Premium Anual',
        price: 1970.00,
        affiliate_link: 'https://checkout.cackto.com.br/premium/anual'
      })
      .eq('id', existingPlans[1].id)
      .select();

    if (annualError) {
      console.log('❌ Erro ao atualizar plano anual:', annualError.message);
    } else {
      console.log('✅ Plano anual atualizado');
    }

    // Se as atualizações diretas falharam, tentar upsert
    if (monthlyError || annualError) {
      console.log('\n--- Tentativa 2: Upsert ---');
      
      const { data: upsertResult, error: upsertError } = await supabase
        .from('plan_configurations')
        .upsert([
          {
            id: existingPlans[0].id,
            name: 'Essencial Mensal',
            plan_type: 'essencial',
            price: 197.90,
            billing_cycle: 'mensal',
            affiliate_link: 'https://checkout.cackto.com.br/essencial/mensal',
            features: ["Gestão básica de clientes", "Orçamentos ilimitados", "Controle de estoque", "Relatórios básicos", "Suporte por email"],
            is_active: true,
            display_order: 1
          },
          {
            id: existingPlans[1].id,
            name: 'Premium Anual',
            plan_type: 'premium',
            price: 1970.00,
            billing_cycle: 'anual',
            affiliate_link: 'https://checkout.cackto.com.br/premium/anual',
            features: ["Tudo do plano mensal", "Relatórios avançados", "Integração com WhatsApp", "Backup automático", "Suporte prioritário", "Múltiplos usuários"],
            is_active: true,
            display_order: 2
          }
        ])
        .select();

      if (upsertError) {
        console.log('❌ Erro no upsert:', upsertError.message);
      } else {
        console.log('✅ Upsert realizado com sucesso');
      }
    }

    // Aguardar e verificar
    console.log('\nAguardando 3 segundos...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verificação final
    console.log('\n--- Verificação final ---');
    const { data: finalPlans, error: finalError } = await supabase
      .from('plan_configurations')
      .select('*')
      .order('id');

    if (finalError) {
      console.error('❌ Erro na verificação final:', finalError);
      return;
    }

    console.log('Estado final dos planos:\n');
    finalPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name}`);
      console.log(`   Preço: R$ ${plan.price}`);
      console.log(`   Link: ${plan.affiliate_link}`);
      console.log(`   Atualizado: ${plan.updated_at}`);
      console.log('');
    });

    // Resumo
    console.log('--- Resumo ---');
    const monthly = finalPlans[0];
    const annual = finalPlans[1];

    console.log(`Plano mensal: ${monthly.price == 197.90 ? '✅' : '❌'} R$ ${monthly.price} (esperado: R$ 197.90)`);
    console.log(`Plano anual: ${annual.price == 1970.00 ? '✅' : '❌'} R$ ${annual.price} (esperado: R$ 1970.00)`);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

simplePlanUpdate();