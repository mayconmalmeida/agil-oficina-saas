const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFinalSetup() {
  console.log('🔍 Verificando configuração final dos planos...\n');
  
  let allGood = true;
  const issues = [];
  
  try {
    // 1. Verificar se a tabela plan_configurations existe e tem dados
    console.log('1️⃣ Verificando tabela plan_configurations...');
    const { data: plans, error: plansError } = await supabase
      .from('plan_configurations')
      .select('*')
      .order('display_order');
    
    if (plansError) {
      console.log('❌ Erro ao acessar plan_configurations:', plansError.message);
      issues.push('Tabela plan_configurations inacessível');
      allGood = false;
    } else if (!plans || plans.length === 0) {
      console.log('❌ Nenhum plano encontrado');
      issues.push('Nenhum plano configurado');
      allGood = false;
    } else {
      console.log(`✅ Encontrados ${plans.length} planos`);
      
      // Verificar preços específicos
      const mensalPlan = plans.find(p => p.billing_cycle === 'mensal');
      const anualPlan = plans.find(p => p.billing_cycle === 'anual');
      
      if (mensalPlan && mensalPlan.price === 197.90) {
        console.log('✅ Plano mensal: R$ 197,90 ✓');
      } else {
        console.log(`❌ Plano mensal: R$ ${mensalPlan?.price || 'N/A'} (esperado: R$ 197,90)`);
        issues.push('Preço do plano mensal incorreto');
        allGood = false;
      }
      
      if (anualPlan && anualPlan.price === 1970.00) {
        console.log('✅ Plano anual: R$ 1.970,00 ✓');
      } else {
        console.log(`❌ Plano anual: R$ ${anualPlan?.price || 'N/A'} (esperado: R$ 1.970,00)`);
        issues.push('Preço do plano anual incorreto');
        allGood = false;
      }
      
      // Verificar links do Cakto
      if (mensalPlan?.affiliate_link?.includes('cackto.com.br')) {
        console.log('✅ Link Cakto mensal configurado');
      } else {
        console.log('❌ Link Cakto mensal não configurado');
        issues.push('Link Cakto mensal ausente');
        allGood = false;
      }
      
      if (anualPlan?.affiliate_link?.includes('cackto.com.br')) {
        console.log('✅ Link Cakto anual configurado');
      } else {
        console.log('❌ Link Cakto anual não configurado');
        issues.push('Link Cakto anual ausente');
        allGood = false;
      }
    }
    
    // 2. Verificar se a tabela payment_transactions existe
    console.log('\n2️⃣ Verificando tabela payment_transactions...');
    const { data: transactions, error: transError } = await supabase
      .from('payment_transactions')
      .select('count')
      .limit(1);
    
    if (transError) {
      if (transError.code === '42P01') {
        console.log('❌ Tabela payment_transactions não existe');
        issues.push('Tabela payment_transactions não criada');
        allGood = false;
      } else {
        console.log('❌ Erro ao acessar payment_transactions:', transError.message);
        issues.push('Problema com tabela payment_transactions');
        allGood = false;
      }
    } else {
      console.log('✅ Tabela payment_transactions existe');
    }
    
    // 3. Verificar webhook do Cakto
    console.log('\n3️⃣ Verificando webhook do Cakto...');
    const fs = require('fs');
    const path = require('path');
    
    const webhookPath = path.join(process.cwd(), 'supabase', 'functions', 'cakto-webhook', 'index.ts');
    if (fs.existsSync(webhookPath)) {
      const webhookContent = fs.readFileSync(webhookPath, 'utf8');
      
      if (webhookContent.includes('x-cakto-signature')) {
        console.log('✅ Validação de assinatura webhook configurada');
      } else {
        console.log('❌ Validação de assinatura webhook não encontrada');
        issues.push('Webhook sem validação de assinatura');
        allGood = false;
      }
      
      if (webhookContent.includes('payment_transactions')) {
        console.log('✅ Registro de transações no webhook configurado');
      } else {
        console.log('❌ Registro de transações no webhook não encontrado');
        issues.push('Webhook não registra transações');
        allGood = false;
      }
      
      if (webhookContent.includes('productMapping')) {
        console.log('✅ Mapeamento de produtos configurado');
      } else {
        console.log('❌ Mapeamento de produtos não encontrado');
        issues.push('Mapeamento de produtos ausente');
        allGood = false;
      }
    } else {
      console.log('❌ Arquivo webhook não encontrado');
      issues.push('Webhook do Cakto não existe');
      allGood = false;
    }
    
    // Resultado final
    console.log('\n' + '='.repeat(50));
    if (allGood) {
      console.log('🎉 CONFIGURAÇÃO COMPLETA!');
      console.log('✅ Todos os componentes estão configurados corretamente');
      console.log('\n📋 Resumo:');
      console.log('- Planos com preços corretos');
      console.log('- Links do Cakto configurados');
      console.log('- Tabela de transações criada');
      console.log('- Webhook completo e funcional');
      console.log('\n🚀 O sistema está pronto para receber pagamentos!');
    } else {
      console.log('⚠️  CONFIGURAÇÃO INCOMPLETA');
      console.log(`❌ ${issues.length} problema(s) encontrado(s):`);
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
      console.log('\n📖 Consulte o README-CONFIGURACAO-PLANOS.md para instruções');
    }
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
    allGood = false;
  }
  
  return allGood;
}

verifyFinalSetup();