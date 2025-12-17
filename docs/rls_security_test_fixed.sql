-- 修復版本的 RLS 安全測試腳本
-- 修復 ROUND 函數語法錯誤

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
    cmd as command_type
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('users', 'lessons', 'favorites', 'practice_logs', 'event_log')
ORDER BY tablename, policyname;

-- 4. 檢查是否有危險的 SECURITY DEFINER 函數
SELECT 
    routine_name,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND security_type = 'DEFINER'
    AND routine_name NOT LIKE 'pg_%';

-- 5. 檢查潛在的安全漏洞
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

-- 6. 檢查 RLS bypass 政策是否正確設定
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
    AND (qual LIKE '%service_role%' OR policyname LIKE '%bypass%')
ORDER BY tablename;

-- 7. 最終安全評分（修復 ROUND 函數）
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
    -- 修復：使用 CAST 和 ROUND 的正確語法
    CAST(ROUND(CAST(secure_tables AS numeric) / CAST(total_tables AS numeric) * 100, 1) AS text) || '%' as security_score_percent,
    CASE 
        WHEN secure_tables = total_tables THEN '🟢 完全安全'
        WHEN secure_tables >= total_tables * 0.8 THEN '🟡 大部分安全'
        ELSE '🔴 需要改善'
    END as security_status
FROM security_check;

-- 8. 生成安全報告摘要
SELECT 
    '=== RLS 安全測試完成 ===' as report_title,
    NOW() as test_time,
    'James Chen' as tested_by,
    '單板教學 App' as project_name;
