const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Get the git commit hash
  const gitHash = execSync('git rev-parse --short HEAD').toString().trim();
  
  // Create or update .env.production.local with the build ID
  const envPath = path.join(__dirname, '..', '.env.production.local');
  const envContent = `NEXT_PUBLIC_BUILD_ID=${gitHash}\n`;
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Build ID set to: ${gitHash}`);
} catch (error) {
  console.warn('⚠️ Could not get git commit hash, using timestamp');
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  const envPath = path.join(__dirname, '..', '.env.production.local');
  const envContent = `NEXT_PUBLIC_BUILD_ID=${timestamp}\n`;
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Build ID set to: ${timestamp}`);
}

