import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAdminLogin() {
  try {
    console.log('Testing admin login with correct credentials...')
    
    // First, let's check if the admins table exists and has data
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('*')
    
    if (adminsError) {
      console.error('Error fetching admins:', adminsError)
      return
    }
    
    console.log('Admins table found:', admins)
    console.log('Number of admins:', admins?.length || 0)
    
    // Check specifically for the admin user
    const adminUser = admins?.find(admin => admin.email === 'mayconintermediacao@gmail.com')
    if (adminUser) {
      console.log('Found admin user:', {
        email: adminUser.email,
        role: adminUser.role,
        active: adminUser.active,
        password_hash_length: adminUser.password_hash?.length || 0
      })
    } else {
      console.log('Admin user mayconintermediacao@gmail.com not found in table')
    }
    
    // Now test the validate_admin_login function with correct credentials
    console.log('\nTesting validate_admin_login function...')
    const { data, error } = await supabase.rpc('validate_admin_login', {
      email: 'mayconintermediacao@gmail.com',
      password: 'admin123'
    })
    
    if (error) {
      console.error('Error calling validate_admin_login:', error)
    } else {
      console.log('validate_admin_login result:', data)
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testAdminLogin()