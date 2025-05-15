
/**
 * This script will update the Supabase types for the project.
 * Run it with: npx ts-node scripts/update-supabase-types.ts
 * 
 * Note: You need to have the Supabase CLI installed.
 * https://supabase.com/docs/guides/cli
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const projectId = 'yjhcozddtbpzvnppcggf';
const typesPath = path.resolve(__dirname, '../src/integrations/supabase/types.ts');

try {
  console.log('Updating Supabase types...');
  
  // Execute the Supabase CLI command to generate types
  const command = `supabase gen types typescript --project-id ${projectId} --schema public > ${typesPath}`;
  execSync(command, { stdio: 'inherit' });
  
  console.log('Types generated successfully!');
  console.log(`Types file updated at: ${typesPath}`);
} catch (error) {
  console.error('Error generating types:', error);
  process.exit(1);
}
