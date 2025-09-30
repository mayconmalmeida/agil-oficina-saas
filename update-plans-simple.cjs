const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePlansSimple() {
  try {
    console.log('Atualizando preços e links dos planos...');
    
    // Buscar todos os planos existentes
    const { data: existingPlans, error: fetchError } = await supabase
      .from('plan_configurations')
      .select('*')
      .order('display_order');
    
    if (fetchError) {
      console.error('Erro ao buscar planos existentes:', fetchError);
      return;
    }
    
    console.log('Planos encontrados:');
    existingPlans?.forEach(plan => {
      console.log(`- ID: ${plan.id}, Nome: ${plan.name}, Ciclo: ${plan.billing_cycle}, Preço: R$ ${plan.price}`);
    });
    
    // Atualizar plano mensal (primeiro plano)
    if (existingPlans && existingPlans.length > 0) {
      const planMensal = existingPlans[0];
      const { error: errorMensal } = await supabase
        .from('plan_configurations')
        .update({
          name: 'Essencial Mensal',
          price: 197.90,
          affiliate_link: 'https://checkout.cackto.com.br/essencial/mensal'
        })
        .eq('id', planMensal.id);
      
      if (errorMensal) {
        console.error('Erro ao atualizar plano mensal:', errorMensal);
      } else {
        console.log('✅ Plano mensal atualizado: Essencial Mensal - R$ 197,90');
      }
    }
    
    // Atualizar plano anual (segundo plano)
    if (existingPlans && existingPlans.length > 1) {
      const planAnual = existingPlans[1];
      const { error: errorAnual } = await supabase
        .from('plan_configurations')
        .update({
          name: 'Premium Anual',
          price: 1970.00,
          affiliate_link: 'https://checkout.cackto.com.br/premium/anual'
        })
        .eq('id', planAnual.id);
      
      if (errorAnual) {
        console.error('Erro ao atualizar plano anual:', errorAnual);
      } else {
        console.log('✅ Plano anual atualizado: Premium Anual - R$ 1.970,00');
      }
    }
    
    // Mostrar resultado final
    console.log('\n--- Resultado final ---');
    const { data: finalPlans, error: finalError } = await supabase
      .from('plan_configurations')
      .select('*')
      .order('display_order');
    
    if (finalError) {
      console.error('Erro ao buscar planos finais:', finalError);
    } else {
      finalPlans?.forEach(plan => {
        console.log(`${plan.name}: R$ ${plan.price} - ${plan.affiliate_link}`);
      });
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

updatePlansSimple();