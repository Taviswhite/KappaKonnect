// Quick script to check if required environment variables are set
// Run with: node check-env.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

console.log('🔍 Checking environment setup...\n');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('\n📝 Create a .env file with:');
  console.log('   VITE_SUPABASE_URL=your_supabase_project_url');
  console.log('   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key\n');
  process.exit(1);
}

console.log('✓ .env file exists');

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

const requiredVars = {
  'VITE_SUPABASE_URL': false,
  'VITE_SUPABASE_PUBLISHABLE_KEY': false
};

// Check for required variables
envLines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key] = trimmed.split('=');
    if (key && requiredVars.hasOwnProperty(key)) {
      requiredVars[key] = true;
    }
  }
});

console.log('\n📋 Environment Variables Status:');
let allSet = true;

Object.entries(requiredVars).forEach(([key, isSet]) => {
  if (isSet) {
    console.log(`   ✓ ${key} is set`);
  } else {
    console.log(`   ✗ ${key} is missing`);
    allSet = false;
  }
});

if (allSet) {
  console.log('\n✅ All required environment variables are set!');
  console.log('   You can now run: npm run dev\n');
  process.exit(0);
} else {
  console.log('\n❌ Some environment variables are missing!');
  console.log('\n📝 Add the missing variables to your .env file:\n');
  Object.entries(requiredVars).forEach(([key, isSet]) => {
    if (!isSet) {
      console.log(`   ${key}=your_value_here`);
    }
  });
  console.log('\n💡 Get these values from: https://app.supabase.com → Your Project → Settings → API\n');
  process.exit(1);
}
