-- 最簡單的 RLS 測試腳本
-- 避免複雜的函數和計算

-- 1. 檢查表格 RLS 狀態
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
    AND tablename IN ('users', 'lessons', 'favorites', 'practice_logs', 'event_log')
ORDER BY tablename;

-- 2. 檢查政策列表
SELECT 
    tablename,
    policyname,
    cmd as command_type
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('users', 'lessons', 'favorites', 'practice_logs', 'event_log')
ORDER BY tablename, policyname;

-- 3. 測試基本查詢
SELECT 'RLS 測試完成' as status;

-- 4. 檢查關鍵函數
SELECT 
    routine_name,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name = 'is_subscription_active';

-- 完成
SELECT '✅ 簡單測試完成' as result;
