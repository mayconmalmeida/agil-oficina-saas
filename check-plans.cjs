const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yjhcozddtbpzvnppcggf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0'
);

async function checkPlans() {
  console.log('Checking plan configurations...');
  const { data, error } = await supabase
    .from('plan_configurations')
    .select('*')
    .order('display_order');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Plans found:', data.length);
    data.forEach(plan => {
      console.log(`- ID: ${plan.id}, Name: ${plan.name}, Type: ${plan.plan_type}`);
    });
  }
}

checkPlans().catch(console.error);