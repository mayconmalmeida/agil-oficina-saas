const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePlanConfigurations() {
  try {
    console.log('Atualizando configurações dos planos...');
    
    // Primeiro, vamos ver todos os planos existentes
    const { data: existingPlans, error: fetchError } = await supabase
      .from('plan_configurations')
      .select('*')
      .order('display_order');
    
    if (fetchError) {
      console.error('Erro ao buscar planos existentes:', fetchError);
      return;
    }
    
    console.log('Planos existentes:', existingPlans?.length || 0);
    existingPlans?.forEach(plan => {
      console.log(`- ${plan.name}: R$ ${plan.price} (${plan.plan_type})`);
    });
    
    // Configurações dos novos planos (sem description que não existe na tabela)
    const planUpdates = [
      {
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
        affiliate_link: 'https://checkout.cackto.com.br/essencial/mensal'
      },
      {
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
        affiliate_link: 'https://checkout.cackto.com.br/premium/anual'
      }
    ];
    
    // Atualizar ou inserir cada plano
    for (const planConfig of planUpdates) {
      // Verificar se o plano já existe
      const existingPlan = existingPlans?.find(p => p.plan_type === planConfig.plan_type);
      
      if (existingPlan) {
        // Atualizar plano existente
        const { data, error } = await supabase
          .from('plan_configurations')
          .update({
            ...planConfig,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPlan.id)
          .select()
          .single();
        
        if (error) {
          console.error(`Erro ao atualizar plano ${planConfig.plan_type}:`, error);
        } else {
          console.log(`✅ Plano ${planConfig.name} atualizado com sucesso`);
        }
      } else {
        // Inserir novo plano
        const { data, error } = await supabase
          .from('plan_configurations')
          .insert([planConfig])
          .select()
          .single();
        
        if (error) {
          console.error(`Erro ao criar plano ${planConfig.plan_type}:`, error);
        } else {
          console.log(`✅ Plano ${planConfig.name} criado com sucesso`);
        }
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

updatePlanConfigurations();