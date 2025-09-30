const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceUpdatePlans() {
  try {
    console.log('Forçando atualização dos planos...');
    
    // Atualizar plano mensal diretamente pelo ID
    const { data: mensalData, error: mensalError } = await supabase
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
      .eq('id', '1d4b2404-00c1-4296-b6f9-3a66f7b1ad86')
      .select();
    
    if (mensalError) {
      console.error('Erro ao atualizar plano mensal:', mensalError);
    } else {
      console.log('✅ Plano mensal atualizado:', mensalData);
    }
    
    // Atualizar plano anual diretamente pelo ID
    const { data: anualData, error: anualError } = await supabase
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
      .eq('id', '176849c8-e937-4dc4-b1dd-8be1130e7252')
      .select();
    
    if (anualError) {
      console.error('Erro ao atualizar plano anual:', anualError);
    } else {
      console.log('✅ Plano anual atualizado:', anualData);
    }
    
    // Aguardar um pouco e verificar novamente
    console.log('\nAguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar resultado final
    console.log('\n--- Verificação final ---');
    const { data: finalPlans, error: finalError } = await supabase
      .from('plan_configurations')
      .select('*')
      .order('display_order');
    
    if (finalError) {
      console.error('Erro ao buscar planos finais:', finalError);
    } else {
      console.log('Planos atualizados:');
      finalPlans?.forEach(plan => {
        console.log(`- ${plan.name}: R$ ${plan.price} (${plan.plan_type})`);
        console.log(`  Link: ${plan.affiliate_link}`);
        console.log(`  Atualizado em: ${plan.updated_at}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

forceUpdatePlans();