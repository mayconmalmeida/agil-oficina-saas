import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdminUser() {
  try {
    console.log('Creating admin user...')
    
    // Generate bcrypt hash for password "admin123"
    const saltRounds = 12
    const passwordHash = await bcrypt.hash('admin123', saltRounds)
    
    console.log('Generated password hash:', passwordHash)
    
    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', 'mayconintermediacao@gmail.com')
      .maybeSingle()
    
    if (existingAdmin) {
      console.log('Admin user already exists, updating password...')
      
      const { data, error } = await supabase
        .from('admins')
        .update({
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('email', 'mayconintermediacao@gmail.com')
        .select()
      
      if (error) {
        console.error('Error updating admin:', error)
        return
      }
      
      console.log('Admin updated successfully:', data)
    } else {
      console.log('Creating new admin user...')
      
      const { data, error } = await supabase
        .from('admins')
        .insert({
          email: 'mayconintermediacao@gmail.com',
          password_hash: passwordHash,
          role: 'superadmin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
      
      if (error) {
        console.error('Error creating admin:', error)
        return
      }
      
      console.log('Admin created successfully:', data)
    }
    
    // Test the login
    console.log('\nTesting login with new credentials...')
    const { data: loginResult, error: loginError } = await supabase.rpc('validate_admin_login', {
      p_email: 'mayconintermediacao@gmail.com',
      p_password: 'admin123'
    })
    
    if (loginError) {
      console.error('Login test error:', loginError)
    } else {
      console.log('Login test result:', loginResult)
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createAdminUser()