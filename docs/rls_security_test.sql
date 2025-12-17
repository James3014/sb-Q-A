-- 完整的 RLS 安全測試腳本
-- 確保所有表格和政策都正確設定

-- 1. 檢查所有表格的 RLS 狀態
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count,
    CASE 
        WHEN rowsecurity = true AND (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) > 0 
        THEN '✅ 安全'
        WHEN rowsecurity = false 
        THEN '❌ RLS 未啟用'
        WHEN (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) = 0 
        THEN '⚠️ 無政策'
        ELSE '❓ 未知狀態'
    END as security_status
FROM pg_tables t
WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%'
ORDER BY tablename;

-- 2. 檢查關鍵函數是否存在
SELECT 
    routine_name,
    routine_type,
    security_type,
    CASE 
        WHEN routine_name = 'is_subscription_active' THEN '✅ 訂閱檢查函數'
        ELSE routine_name
    END as function_purpose
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN ('is_subscription_active')
ORDER BY routine_name;

-- 3. 檢查每個重要表格的政策詳情
SELECT 
    tablename,
    policyname,
    cmd as command_type,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('users', 'lessons', 'favorites', 'practice_logs', 'event_log')
ORDER BY tablename, policyname;

-- 4. 檢查是否有危險的 SECURITY DEFINER 函數
SELECT 
    routine_name,
    security_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND security_type = 'DEFINER'
    AND routine_name NOT LIKE 'pg_%';

-- 5. 測試基本權限場景

-- 測試 1: 檢查 lessons 表的權限
EXPLAIN (FORMAT TEXT) 
SELECT id, title, is_premium 
FROM public.lessons 
WHERE is_premium = false 
LIMIT 1;

-- 測試 2: 檢查 users 表的自我存取
EXPLAIN (FORMAT TEXT)
SELECT id, email 
FROM public.users 
WHERE id = auth.uid() 
LIMIT 1;

-- 6. 檢查潛在的安全漏洞

-- 檢查是否有表格沒有 RLS 但有敏感資料
SELECT 
    t.tablename,
    t.rowsecurity,
    c.column_name,
    c.data_type
FROM pg_tables t
JOIN information_schema.columns c ON c.table_name = t.tablename
WHERE t.schemaname = 'public'
    AND t.rowsecurity = false
    AND c.column_name IN ('email', 'password', 'token', 'key', 'secret', 'payment')
    AND t.tablename NOT LIKE 'pg_%'
ORDER BY t.tablename, c.column_name;

-- 7. 檢查是否有公開的敏感視圖
SELECT 
    table_name,
    view_definition
FROM information_schema.views 
WHERE table_schema = 'public'
    AND (view_definition ILIKE '%password%' 
         OR view_definition ILIKE '%token%' 
         OR view_definition ILIKE '%secret%'
         OR view_definition ILIKE '%key%');

-- 8. 檢查 RLS bypass 政策是否正確設定
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
    AND (qual LIKE '%service_role%' OR policyname LIKE '%bypass%')
ORDER BY tablename;

-- 9. 最終安全評分
WITH security_check AS (
    SELECT 
        COUNT(*) as total_tables,
        COUNT(CASE WHEN rowsecurity = true THEN 1 END) as rls_enabled_tables,
        COUNT(CASE WHEN rowsecurity = true AND 
                   (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) > 0 
                   THEN 1 END) as secure_tables
    FROM pg_tables t
    WHERE schemaname = 'public'
        AND tablename IN ('users', 'lessons', 'favorites', 'practice_logs', 'event_log', 
                         'feedback', 'payments', 'affiliate_partners', 'affiliate_clicks', 
                         'affiliate_commissions')
)
SELECT 
    total_tables,
    rls_enabled_tables,
    secure_tables,
    ROUND((secure_tables::float / total_tables::float) * 100, 1) as security_score_percent,
    CASE 
        WHEN secure_tables = total_tables THEN '🟢 完全安全'
        WHEN secure_tables >= total_tables * 0.8 THEN '🟡 大部分安全'
        ELSE '🔴 需要改善'
    END as security_status
FROM security_check;

-- 10. 生成安全報告摘要
SELECT 
    '=== RLS 安全測試完成 ===' as report_title,
    NOW() as test_time,
    'James Chen' as tested_by,
    '單板教學 App' as project_name;
