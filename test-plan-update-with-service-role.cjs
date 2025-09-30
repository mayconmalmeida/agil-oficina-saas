const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase com service role key
const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co';
// Note: This would need the service role key, not the anon key
// For security, we'll try with anon key first and see if RLS allows it
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPlanUpdate() {
  try {
    console.log('Testando atualização dos planos...');
    
    // Primeiro, vamos verificar as políticas atuais
    console.log('\n--- Verificando políticas RLS ---');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'plan_configurations' })
      .catch(() => {
        console.log('Função get_table_policies não disponível, continuando...');
        return { data: null, error: null };
      });
    
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
      console.log(`- ID: ${plan.id}, Nome: ${plan.name}, Preço: R$ ${plan.price}`);
    });
    
    // Tentar atualizar o primeiro plano (mensal)
    if (existingPlans && existingPlans.length > 0) {
      console.log('\n--- Tentando atualizar plano mensal ---');
      const planMensal = existingPlans[0];
      
      const { data: updateData, error: updateError } = await supabase
        .from('plan_configurations')
        .update({
          name: 'Essencial Mensal',
          plan_type: 'essencial_mensal',
          price: 197.90,
          affiliate_link: 'https://checkout.cackto.com.br/essencial/mensal',
          features: [
            'Gestão de clientes e veículos',
            'Orçamentos e ordens de serviço',
            'Controle financeiro básico',
            'Relatórios essenciais',
            'Suporte por email'
          ],
          updated_at: new Date().toISOString()
        })
        .eq('id', planMensal.id)
        .select();
      
      if (updateError) {
        console.error('Erro ao atualizar plano mensal:', updateError);
        console.log('Código do erro:', updateError.code);
        console.log('Detalhes:', updateError.details);
        console.log('Mensagem:', updateError.message);
      } else {
        console.log('✅ Plano mensal atualizado com sucesso!');
        console.log('Dados atualizados:', updateData);
      }
    }
    
    // Tentar atualizar o segundo plano (anual)
    if (existingPlans && existingPlans.length > 1) {
      console.log('\n--- Tentando atualizar plano anual ---');
      const planAnual = existingPlans[1];
      
      const { data: updateData, error: updateError } = await supabase
        .from('plan_configurations')
        .update({
          name: 'Premium Anual',
          plan_type: 'premium_anual',
          price: 1970.00,
          affiliate_link: 'https://checkout.cackto.com.br/premium/anual',
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
          updated_at: new Date().toISOString()
        })
        .eq('id', planAnual.id)
        .select();
      
      if (updateError) {
        console.error('Erro ao atualizar plano anual:', updateError);
        console.log('Código do erro:', updateError.code);
        console.log('Detalhes:', updateError.details);
        console.log('Mensagem:', updateError.message);
      } else {
        console.log('✅ Plano anual atualizado com sucesso!');
        console.log('Dados atualizados:', updateData);
      }
    }
    
    // Verificar resultado final
    console.log('\n--- Verificação final ---');
    const { data: finalPlans, error: finalError } = await supabase
      .from('plan_configurations')
      .select('*')
      .order('display_order');
    
    if (finalError) {
      console.error('Erro ao buscar planos finais:', finalError);
    } else {
      console.log('Estado final dos planos:');
      finalPlans?.forEach(plan => {
        console.log(`- ${plan.name}: R$ ${plan.price} (${plan.plan_type})`);
        console.log(`  Link: ${plan.affiliate_link}`);
        console.log(`  Atualizado: ${plan.updated_at}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

testPlanUpdate();