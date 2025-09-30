const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePlansWithFullData() {
  try {
    console.log('Atualizando planos com dados completos...');
    
    // Buscar planos existentes
    const { data: existingPlans, error: fetchError } = await supabase
      .from('plan_configurations')
      .select('*')
      .order('display_order');
    
    if (fetchError) {
      console.error('Erro ao buscar planos:', fetchError);
      return;
    }
    
    console.log(`Encontrados ${existingPlans?.length || 0} planos`);
    
    // Atualizar primeiro plano (mensal) - ID específico
    console.log('\n--- Atualizando plano mensal ---');
    const { data: mensalResult, error: mensalError } = await supabase
      .from('plan_configurations')
      .update({
        plan_type: 'essencial_mensal',
        billing_cycle: 'mensal',
        name: 'Essencial Mensal',
        price: 197.90,
        currency: 'BRL',
        features: [
          'Gestão de clientes e veículos',
          'Orçamentos e ordens de serviço',
          'Controle financeiro básico',
          'Relatórios essenciais',
          'Suporte por email'
        ],
        is_active: true,
        display_order: 1,
        affiliate_link: 'https://checkout.cackto.com.br/essencial/mensal',
        updated_at: new Date().toISOString()
      })
      .eq('id', '1d4b2404-00c1-4296-b6f9-3a66f7b1ad86');
    
    if (mensalError) {
      console.error('❌ Erro ao atualizar plano mensal:', mensalError);
    } else {
      console.log('✅ Plano mensal atualizado');
    }
    
    // Atualizar segundo plano (anual) - ID específico
    console.log('\n--- Atualizando plano anual ---');
    const { data: anualResult, error: anualError } = await supabase
      .from('plan_configurations')
      .update({
        plan_type: 'premium_anual',
        billing_cycle: 'anual',
        name: 'Premium Anual',
        price: 1970.00,
        currency: 'BRL',
        features: [
          'Todos os recursos do plano Essencial',
          'Módulo de estoque integrado',
          'Agendamento de serviços',
          'Relatórios avançados',
          'Suporte prioritário',
          'Backup automático',
          'Integração com contabilidade',
          '2 meses grátis (economia de R$ 359,80)'
        ],
        is_active: true,
        display_order: 2,
        affiliate_link: 'https://checkout.cackto.com.br/premium/anual',
        updated_at: new Date().toISOString()
      })
      .eq('id', '176849c8-e937-4dc4-b1dd-8be1130e7252');
    
    if (anualError) {
      console.error('❌ Erro ao atualizar plano anual:', anualError);
    } else {
      console.log('✅ Plano anual atualizado');
    }
    
    // Aguardar um pouco para o cache atualizar
    console.log('\nAguardando 3 segundos para cache atualizar...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar resultado final com nova consulta
    console.log('\n--- Verificação final (nova consulta) ---');
    const { data: finalPlans, error: finalError } = await supabase
      .from('plan_configurations')
      .select('*')
      .order('display_order');
    
    if (finalError) {
      console.error('Erro ao buscar planos finais:', finalError);
    } else {
      console.log('Planos atualizados:');
      finalPlans?.forEach((plan, index) => {
        console.log(`\n${index + 1}. ${plan.name}`);
        console.log(`   Tipo: ${plan.plan_type}`);
        console.log(`   Preço: R$ ${plan.price}`);
        console.log(`   Ciclo: ${plan.billing_cycle}`);
        console.log(`   Link: ${plan.affiliate_link}`);
        console.log(`   Ativo: ${plan.is_active}`);
        console.log(`   Atualizado: ${plan.updated_at}`);
      });
      
      // Verificar se os preços foram realmente atualizados
      const mensalPlan = finalPlans?.find(p => p.billing_cycle === 'mensal');
      const anualPlan = finalPlans?.find(p => p.billing_cycle === 'anual');
      
      console.log('\n--- Resumo das atualizações ---');
      if (mensalPlan && mensalPlan.price === 197.90) {
        console.log('✅ Plano mensal: Preço atualizado para R$ 197,90');
      } else {
        console.log(`❌ Plano mensal: Preço ainda é R$ ${mensalPlan?.price || 'N/A'}`);
      }
      
      if (anualPlan && anualPlan.price === 1970.00) {
        console.log('✅ Plano anual: Preço atualizado para R$ 1.970,00');
      } else {
        console.log(`❌ Plano anual: Preço ainda é R$ ${anualPlan?.price || 'N/A'}`);
      }
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

updatePlansWithFullData();