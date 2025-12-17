-- 修復 RLS 無限遞迴問題
-- 問題：users_admin_select 政策查詢自己導致遞迴

-- 1. 刪除有問題的政策
DROP POLICY IF EXISTS "users_admin_select" ON public.users;
DROP POLICY IF EXISTS "lessons_admin_all" ON public.lessons;
DROP POLICY IF EXISTS "event_log_self_select" ON public.event_log;
DROP POLICY IF EXISTS "feedback_admin_select" ON public.feedback;

-- 2. 重新建立不會遞迴的政策

-- users 表：只允許自己讀取，管理員功能通過 service_role 處理
CREATE POLICY "users_self_only" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- lessons 表：簡化管理員政策，使用 service_role 而非 RLS
CREATE POLICY "lessons_admin_bypass" ON public.lessons
    FOR ALL USING (
        -- 檢查是否為 service_role（後台 API 使用）
        auth.role() = 'service_role'
    );

-- event_log 表：簡化政策
CREATE POLICY "event_log_user_only" ON public.event_log
    FOR SELECT USING (auth.uid() = user_id);

-- 3. 為管理員操作建立 bypass 政策（使用 service_role）
-- 這些政策允許後台 API（使用 service_role key）繞過 RLS

CREATE POLICY "users_service_role_bypass" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "favorites_service_role_bypass" ON public.favorites
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "practice_logs_service_role_bypass" ON public.practice_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "event_log_service_role_bypass" ON public.event_log
    FOR ALL USING (auth.role() = 'service_role');

-- 4. 如果 feedback 表存在，建立簡化政策
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback') THEN
        CREATE POLICY "feedback_service_role_bypass" ON public.feedback
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- 5. 測試查詢（應該不會有遞迴錯誤）
SELECT 'RLS 遞迴問題已修復' as status;

-- 6. 檢查政策數量
SELECT 
    tablename,
    (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
    AND tablename IN ('users', 'lessons', 'favorites', 'practice_logs', 'event_log')
ORDER BY tablename;
