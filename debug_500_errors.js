#!/usr/bin/env node

/**
 * Debug script for HTTP 500 errors
 * Tests both coupon redemption and UserCore connectivity
 */

const https = require('https');
const http = require('http');

// Test UserCore connectivity
async function testUserCore() {
  console.log('🔍 Testing UserCore connectivity...');
  
  try {
    const response = await fetch('https://user-core.zeabur.app/health', {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      console.log('✅ UserCore is responding');
      const data = await response.text();
      console.log('   Response:', data);
    } else {
      console.log('❌ UserCore returned:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ UserCore connection failed:', error.message);
    
    // Try alternative endpoints
    console.log('   Trying alternative endpoints...');
    
    try {
      const altResponse = await fetch('https://user-core.zeabur.app/', {
        method: 'GET',
        timeout: 3000
      });
      console.log('   Root endpoint status:', altResponse.status);
    } catch (altError) {
      console.log('   Root endpoint also failed:', altError.message);
    }
  }
}

// Test local coupon API
async function testCouponAPI() {
  console.log('\n🔍 Testing coupon API locally...');
  
  // This would need to be run from within the Next.js environment
  // For now, just check if the function file exists
  const fs = require('fs');
  const path = require('path');
  
  const functionPath = path.join(__dirname, 'web/src/app/api/coupons/redeem/route.ts');
  
  if (fs.existsSync(functionPath)) {
    console.log('✅ Coupon API route file exists');
    
    // Check if the SQL fix file exists
    const sqlFixPath = path.join(__dirname, 'fix_coupon_function.sql');
    if (fs.existsSync(sqlFixPath)) {
      console.log('✅ SQL fix file created');
      console.log('   Next step: Apply the SQL fix to your Supabase database');
      console.log('   Run the contents of fix_coupon_function.sql in Supabase SQL Editor');
    } else {
      console.log('❌ SQL fix file not found');
    }
  } else {
    console.log('❌ Coupon API route file not found');
  }
}

// Check database connection (would need Supabase client)
function checkDatabaseIssues() {
  console.log('\n🔍 Database issues to check:');
  console.log('   1. Run fix_coupon_function.sql in Supabase SQL Editor');
  console.log('   2. Verify coupons table exists with test data');
  console.log('   3. Check subscription_plans table exists');
  console.log('   4. Verify RLS policies are not blocking the function');
  
  console.log('\n📋 SQL to run in Supabase:');
  console.log('   -- Check if function exists');
  console.log('   SELECT proname FROM pg_proc WHERE proname = \'redeem_trial_coupon\';');
  console.log('   ');
  console.log('   -- Test function with dummy data');
  console.log('   SELECT * FROM redeem_trial_coupon(');
  console.log('     \'00000000-0000-0000-0000-000000000000\'::uuid,');
  console.log('     \'TESTCODE\',');
  console.log('     \'127.0.0.1\',');
  console.log('     \'test-agent\'');
  console.log('   );');
}

// Main execution
async function main() {
  console.log('🚨 Debugging HTTP 500 Errors\n');
  console.log('Issues found:');
  console.log('1. POST /api/coupons/redeem 500 (Internal Server Error)');
  console.log('2. POST /api/usercore/proxy 500 (Internal Server Error)\n');
  
  await testUserCore();
  await testCouponAPI();
  checkDatabaseIssues();
  
  console.log('\n🔧 Recommended fixes:');
  console.log('1. Apply fix_coupon_function.sql to fix coupon redemption');
  console.log('2. Check if UserCore service is running at user-core.zeabur.app');
  console.log('3. Verify environment variables are set correctly');
  console.log('4. Check Supabase connection and RLS policies');
}

main().catch(console.error);
