const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yjhcozddtbpzvnppcggf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0'
);

async function testPlanUpdate() {
  console.log('Testing plan update...');
  
  // First, get the plans
  const { data: plans, error: fetchError } = await supabase
    .from('plan_configurations')
    .select('*')
    .order('display_order');
  
  if (fetchError) {
    console.error('Error fetching plans:', fetchError);
    return;
  }
  
  console.log('Plans found:', plans.length);
  plans.forEach(plan => {
    console.log(`- ID: ${plan.id}, Name: ${plan.name}`);
  });
  
  if (plans.length === 0) {
    console.log('No plans to update');
    return;
  }
  
  // Try to update the first plan
  const planToUpdate = plans[0];
  console.log(`\nTrying to update plan: ${planToUpdate.name} (ID: ${planToUpdate.id})`);
  
  try {
    const { data, error } = await supabase
      .from('plan_configurations')
      .update({ 
        name: 'Essencial Mensal Updated',
        updated_at: new Date().toISOString() 
      })
      .eq('id', planToUpdate.id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
    } else {
      console.log('Update successful:', data);
    }
  } catch (err) {
    console.error('Caught error:', err);
  }
  
  // Let's also try without .single() to see what happens
  console.log('\nTrying update without .single()...');
  try {
    const { data, error } = await supabase
      .from('plan_configurations')
      .update({ 
        name: 'Essencial Mensal Updated 2',
        updated_at: new Date().toISOString() 
      })
      .eq('id', planToUpdate.id)
      .select();

    if (error) {
      console.error('Update error (no single):', error);
    } else {
      console.log('Update successful (no single):', data);
      console.log('Rows returned:', data.length);
    }
  } catch (err) {
    console.error('Caught error (no single):', err);
  }
}

testPlanUpdate().catch(console.error);