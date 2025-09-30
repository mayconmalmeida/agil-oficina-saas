const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPaymentTransactionsTable() {
  try {
    console.log('Checking payment_transactions table...');
    
    // Tentar buscar dados da tabela
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Error accessing payment_transactions table:', error);
      console.log('Table might not exist. Creating migration...');
      return false;
    }

    console.log('payment_transactions table exists!');
    console.log('Records found:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('First record:', JSON.stringify(data[0], null, 2));
    }
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

checkPaymentTransactionsTable();