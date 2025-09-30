const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateExistingPlans() {
  try {
    console.log('Atualizando planos existentes...');
    
    // Buscar todos os planos existentes
    const { data: existingPlans, error: fetchError } = await supabase
      .from('plan_configurations')
      .select('*')
      .order('display_order');
    
    if (fetchError) {
      console.error('Erro ao buscar planos existentes:', fetchError);
      return;
    }
    
    console.log('Planos encontrados:', existingPlans?.length || 0);
    
    // Atualizar o plano Premium Mensal para ter o preço correto
    const premiumMensal = existingPlans?.find(p => p.billing_cycle === 'mensal');
    if (premiumMensal) {
      const { data, error } = await supabase
        .from('plan_configurations')
        .update({
          name: 'Essencial Mensal',
          plan_type: 'essencial_mensal',
          price: 197.90,
          features: [
            'Gestão de clientes e veículos',
            'Orçamentos e ordens de serviço',
            'Controle financeiro básico',
            'Relatórios essenciais',
            'Suporte por email'
          ],
          affiliate_link: 'https://checkout.cackto.com.br/essencial/mensal',
          updated_at: new Date().toISOString()
        })
        .eq('id', premiumMensal.id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar plano mensal:', error);
      } else {
        console.log('✅ Plano mensal atualizado para Essencial Mensal - R$ 197,90');
      }
    }
    
    // Atualizar o plano Premium Anual para ter o preço correto
    const premiumAnual = existingPlans?.find(p => p.billing_cycle === 'anual');
    if (premiumAnual) {
      const { data, error } = await supabase
        .from('plan_configurations')
        .update({
          name: 'Premium Anual',
          plan_type: 'premium_anual',
          price: 1970.00,
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
          affiliate_link: 'https://checkout.cackto.com.br/premium/anual',
          updated_at: new Date().toISOString()
        })
        .eq('id', premiumAnual.id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar plano anual:', error);
      } else {
        console.log('✅ Plano anual atualizado para Premium Anual - R$ 1.970,00');
      }
    }
    
    // Mostrar resultado final
    console.log('\n--- Configuração final dos planos ---');
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

updateExistingPlans();