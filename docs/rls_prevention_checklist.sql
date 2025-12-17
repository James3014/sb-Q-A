-- RLS 預防措施和檢查清單
-- 確保未來新增功能時不會忘記安全設定

-- 1. 建立自動檢查函數
CREATE OR REPLACE FUNCTION public.check_table_security()
RETURNS TABLE(
    table_name text,
    rls_enabled boolean,
    policy_count bigint,
    security_status text,
    recommendation text
)
LANGUAGE sql
SECURITY INVOKER
AS $$
    SELECT 
        t.tablename::text,
        t.rowsecurity,
        (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename),
        CASE 
            WHEN t.rowsecurity = true AND (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) > 0 
            THEN '✅ 安全'
            WHEN t.rowsecurity = false 
            THEN '❌ RLS 未啟用'
            WHEN (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) = 0 
            THEN '⚠️ 無政策'
            ELSE '❓ 未知狀態'
        END::text,
        CASE 
            WHEN t.rowsecurity = true AND (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) > 0 
            THEN '無需行動'
            WHEN t.rowsecurity = false 
            THEN '請執行: ALTER TABLE ' || t.tablename || ' ENABLE ROW LEVEL SECURITY;'
            WHEN (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) = 0 
            THEN '請為 ' || t.tablename || ' 建立適當的 RLS 政策'
            ELSE '請檢查 ' || t.tablename || ' 的設定'
        END::text
    FROM pg_tables t
    WHERE t.schemaname = 'public'
        AND t.tablename NOT LIKE 'pg_%'
        AND t.tablename NOT LIKE 'sql_%'
    ORDER BY t.tablename;
$$;

-- 2. 建立新表格安全模板
CREATE OR REPLACE FUNCTION public.secure_new_table(table_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    result text;
BEGIN
    -- 啟用 RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    
    -- 建立基本的 service_role bypass 政策
    EXECUTE format('CREATE POLICY "%s_service_role_bypass" ON public.%I FOR ALL USING (auth.role() = ''service_role'')', 
                   table_name, table_name);
    
    result := format('✅ 表格 %s 已啟用 RLS 並建立基本安全政策', table_name);
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN format('❌ 設定 %s 時發生錯誤: %s', table_name, SQLERRM);
END;
$$;

-- 3. 建立安全檢查排程提醒（註解形式的 TODO）
/*
TODO: 設定定期安全檢查
1. 每週執行: SELECT * FROM public.check_table_security();
2. 新功能上線前執行安全測試
3. 資料庫 schema 變更後執行檢查
4. 定期檢查 Supabase Security Advisor
*/

-- 4. 常用的安全政策模板

-- 用戶自己的資料政策模板
/*
CREATE POLICY "TABLE_NAME_self_access" ON public.TABLE_NAME
    FOR ALL USING (auth.uid() = user_id);
*/

-- 需要訂閱的功能政策模板  
/*
CREATE POLICY "TABLE_NAME_subscription_required" ON public.TABLE_NAME
    FOR ALL USING (
        auth.uid() = user_id AND 
        public.is_subscription_active(auth.uid())
    );
*/

-- 管理員 bypass 政策模板
/*
CREATE POLICY "TABLE_NAME_service_role_bypass" ON public.TABLE_NAME
    FOR ALL USING (auth.role() = 'service_role');
*/

-- 公開讀取政策模板
/*
CREATE POLICY "TABLE_NAME_public_read" ON public.TABLE_NAME
    FOR SELECT USING (true);
*/

-- 5. 新表格檢查清單函數
CREATE OR REPLACE FUNCTION public.new_table_checklist(table_name text)
RETURNS TABLE(
    check_item text,
    status text,
    action_needed text
)
LANGUAGE sql
SECURITY INVOKER
AS $$
    SELECT 
        check_items.item::text,
        CASE 
            WHEN check_items.item = 'RLS 啟用' THEN
                CASE WHEN t.rowsecurity THEN '✅ 已啟用' ELSE '❌ 未啟用' END
            WHEN check_items.item = '政策存在' THEN
                CASE WHEN (SELECT count(*) FROM pg_policies WHERE tablename = table_name) > 0 
                     THEN '✅ 已設定' ELSE '❌ 無政策' END
            WHEN check_items.item = 'Service Role Bypass' THEN
                CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = table_name AND qual LIKE '%service_role%')
                     THEN '✅ 已設定' ELSE '❌ 缺少' END
            ELSE '❓ 未知'
        END::text,
        CASE 
            WHEN check_items.item = 'RLS 啟用' AND NOT t.rowsecurity THEN
                'ALTER TABLE ' || table_name || ' ENABLE ROW LEVEL SECURITY;'
            WHEN check_items.item = '政策存在' AND (SELECT count(*) FROM pg_policies WHERE tablename = table_name) = 0 THEN
                '需要建立適當的 RLS 政策'
            WHEN check_items.item = 'Service Role Bypass' AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = table_name AND qual LIKE '%service_role%') THEN
                '建立 service_role bypass 政策'
            ELSE '無需行動'
        END::text
    FROM (VALUES 
        ('RLS 啟用'),
        ('政策存在'), 
        ('Service Role Bypass')
    ) AS check_items(item)
    CROSS JOIN (
        SELECT rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = new_table_checklist.table_name
    ) t;
$$;

-- 6. 使用範例和說明
/*
=== 使用方式 ===

1. 檢查所有表格安全狀態:
   SELECT * FROM public.check_table_security();

2. 為新表格設定基本安全:
   SELECT public.secure_new_table('new_table_name');

3. 檢查特定表格的安全清單:
   SELECT * FROM public.new_table_checklist('table_name');

4. 定期執行 (建議每週):
   SELECT * FROM public.check_table_security() WHERE security_status != '✅ 安全';

=== 新功能開發流程 ===

1. 建立新表格
2. 執行: SELECT public.secure_new_table('新表格名稱');
3. 根據需求建立具體的 RLS 政策
4. 執行: SELECT * FROM public.new_table_checklist('新表格名稱');
5. 確認所有檢查項目都是 ✅

=== 緊急修復 ===

如果發現安全問題:
1. 立即執行: ALTER TABLE 表格名 ENABLE ROW LEVEL SECURITY;
2. 建立臨時 bypass: CREATE POLICY "temp_bypass" ON 表格名 FOR ALL USING (auth.role() = 'service_role');
3. 再建立具體的安全政策
4. 刪除臨時政策: DROP POLICY "temp_bypass" ON 表格名;
*/

SELECT '🛡️ RLS 預防措施腳本建立完成！' as status;
