#!/usr/bin/env node

/**
 * 自動化安全檢查腳本
 * 用於 CI/CD 或定期檢查 RLS 安全狀態
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY 環境變數');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSSecurity() {
  console.log('🔍 開始 RLS 安全檢查...\n');

  try {
    // 1. 檢查所有表格的 RLS 狀態
    const { data: tableStatus, error: tableError } = await supabase
      .rpc('check_table_security');

    if (tableError) {
      console.error('❌ 無法檢查表格安全狀態:', tableError.message);
      return false;
    }

    console.log('📊 表格安全狀態:');
    console.table(tableStatus);

    // 2. 檢查是否有不安全的表格
    const unsafeTables = tableStatus.filter(table => 
      table.security_status !== '✅ 安全'
    );

    if (unsafeTables.length > 0) {
      console.log('\n⚠️ 發現不安全的表格:');
      unsafeTables.forEach(table => {
        console.log(`- ${table.table_name}: ${table.security_status}`);
        console.log(`  建議: ${table.recommendation}\n`);
      });
      return false;
    }

    // 3. 檢查關鍵函數
    const { data: functions, error: funcError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, security_type')
      .eq('routine_schema', 'public')
      .eq('routine_name', 'is_subscription_active');

    if (funcError) {
      console.log('⚠️ 無法檢查函數狀態');
    } else if (functions.length === 0) {
      console.log('❌ 缺少 is_subscription_active 函數');
      return false;
    } else {
      console.log('✅ 關鍵函數存在');
    }

    // 4. 測試基本查詢
    const { data: testQuery, error: queryError } = await supabase
      .from('lessons')
      .select('id, title')
      .eq('is_premium', false)
      .limit(1);

    if (queryError) {
      console.log('❌ 基本查詢測試失敗:', queryError.message);
      return false;
    } else {
      console.log('✅ 基本查詢測試通過');
    }

    console.log('\n🎉 所有安全檢查通過！');
    return true;

  } catch (error) {
    console.error('❌ 安全檢查過程中發生錯誤:', error.message);
    return false;
  }
}

async function generateSecurityReport() {
  console.log('\n📋 生成安全報告...');

  const report = {
    timestamp: new Date().toISOString(),
    project: '單板教學 App',
    checks: []
  };

  try {
    // 檢查 RLS 狀態
    const { data: rlsStatus } = await supabase.rpc('check_table_security');
    
    const secureCount = rlsStatus?.filter(t => t.security_status === '✅ 安全').length || 0;
    const totalCount = rlsStatus?.length || 0;
    const securityScore = totalCount > 0 ? Math.round((secureCount / totalCount) * 100) : 0;

    report.checks.push({
      name: 'RLS 政策檢查',
      status: securityScore === 100 ? 'PASS' : 'FAIL',
      score: `${securityScore}%`,
      details: `${secureCount}/${totalCount} 表格安全`
    });

    // 檢查函數存在性
    const { data: functions } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .eq('routine_name', 'is_subscription_active');

    report.checks.push({
      name: '關鍵函數檢查',
      status: functions && functions.length > 0 ? 'PASS' : 'FAIL',
      details: 'is_subscription_active 函數'
    });

    // 輸出報告
    console.log('\n📄 安全報告:');
    console.log('='.repeat(50));
    console.log(`專案: ${report.project}`);
    console.log(`時間: ${report.timestamp}`);
    console.log('='.repeat(50));
    
    report.checks.forEach(check => {
      const status = check.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${check.name}: ${check.status}`);
      if (check.score) console.log(`   評分: ${check.score}`);
      if (check.details) console.log(`   詳情: ${check.details}`);
    });

    console.log('='.repeat(50));

    return report;

  } catch (error) {
    console.error('❌ 生成報告時發生錯誤:', error.message);
    return null;
  }
}

async function main() {
  console.log('🛡️ 單板教學 App - RLS 安全檢查工具');
  console.log('='.repeat(50));

  const isSecure = await checkRLSSecurity();
  const report = await generateSecurityReport();

  if (!isSecure) {
    console.log('\n🚨 安全檢查未通過，請檢查上述問題');
    process.exit(1);
  }

  console.log('\n✅ 安全檢查完成，系統安全！');
  process.exit(0);
}

// 如果直接執行此腳本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 腳本執行失敗:', error.message);
    process.exit(1);
  });
}

module.exports = {
  checkRLSSecurity,
  generateSecurityReport
};
