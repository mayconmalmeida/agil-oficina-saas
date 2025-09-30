const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPlanUpdateSimple() {
  try {
    console.log('Testando atualização dos planos (versão simplificada)...');
    
    // Buscar planos existentes
    console.log('\n--- Buscando planos existentes ---');
    const { data: existingPlans, error: fetchError } = await supabase
      .from('plan_configurations')
      .select('*')
      .order('display_order');
    
    if (fetchError) {
      console.error('Erro ao buscar planos:', fetchError);
      return;
    }
    
    console.log(`Encontrados ${existingPlans?.length || 0} planos:`);
    existingPlans?.forEach(plan => {
      console.log(`- ID: ${plan.id}, Nome: ${plan.name}, Preço: R$ ${plan.price}, Tipo: ${plan.plan_type}`);
    });
    
    // Tentar atualizar apenas o preço do primeiro plano (teste simples)
    if (existingPlans && existingPlans.length > 0) {
      console.log('\n--- Tentando atualizar apenas o preço do plano mensal ---');
      const planMensal = existingPlans[0];
      
      const { data: updateData, error: updateError } = await supabase
        .from('plan_configurations')
        .update({
          price: 197.90
        })
        .eq('id', planMensal.id)
        .select();
      
      if (updateError) {
        console.error('❌ Erro ao atualizar plano mensal:');
        console.log('  Código:', updateError.code);
        console.log('  Mensagem:', updateError.message);
        console.log('  Detalhes:', updateError.details);
        console.log('  Hint:', updateError.hint);
        
        // Vamos tentar entender melhor o problema
        if (updateError.code === '42501') {
          console.log('\n🔍 Problema identificado: Row Level Security (RLS)');
          console.log('   A política RLS está bloqueando a atualização.');
          console.log('   Soluções possíveis:');
          console.log('   1. Executar o arquivo fix-plan-configurations-rls.sql no Supabase Dashboard');
          console.log('   2. Usar service role key em vez de anon key');
          console.log('   3. Fazer login como admin antes de tentar atualizar');
        }
      } else {
        console.log('✅ Plano mensal atualizado com sucesso!');
        console.log('Dados atualizados:', updateData);
      }
    }
    
    // Se a primeira atualização funcionou, tentar a segunda
    if (existingPlans && existingPlans.length > 1) {
      console.log('\n--- Tentando atualizar apenas o preço do plano anual ---');
      const planAnual = existingPlans[1];
      
      const { data: updateData, error: updateError } = await supabase
        .from('plan_configurations')
        .update({
          price: 1970.00
        })
        .eq('id', planAnual.id)
        .select();
      
      if (updateError) {
        console.error('❌ Erro ao atualizar plano anual:');
        console.log('  Código:', updateError.code);
        console.log('  Mensagem:', updateError.message);
        console.log('  Detalhes:', updateError.details);
      } else {
        console.log('✅ Plano anual atualizado com sucesso!');
        console.log('Dados atualizados:', updateData);
      }
    }
    
    // Verificar resultado final
    console.log('\n--- Estado final dos planos ---');
    const { data: finalPlans, error: finalError } = await supabase
      .from('plan_configurations')
      .select('*')
      .order('display_order');
    
    if (finalError) {
      console.error('Erro ao buscar planos finais:', finalError);
    } else {
      finalPlans?.forEach(plan => {
        console.log(`${plan.name}: R$ ${plan.price} (${plan.plan_type})`);
        console.log(`  Link: ${plan.affiliate_link || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

testPlanUpdateSimple();