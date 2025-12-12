#!/usr/bin/env node

// 測試折扣碼 API
async function testAPI() {
  console.log('🧪 測試折扣碼 API...');
  
  // 測試不同情況
  const tests = [
    { code: '', desc: '空折扣碼' },
    { code: 'INVALID', desc: '無效折扣碼' },
    { code: 'TEST2025', desc: '有效折扣碼（無認證）' }
  ];

  for (const test of tests) {
    console.log(`\n📋 測試: ${test.desc}`);
    
    try {
      const response = await fetch('https://www.snowskill.app/api/coupons/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: test.code })
      });

      const result = await response.json();
      console.log(`   狀態: ${response.status}`);
      console.log(`   回應:`, result);
      
    } catch (error) {
      console.log(`   錯誤: ${error.message}`);
    }
  }
}

testAPI();
