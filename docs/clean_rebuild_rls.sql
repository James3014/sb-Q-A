-- 安全的 RLS 政策清理和重建腳本
-- 處理政策已存在的錯誤

-- 1. 完全清理所有現有政策（避免衝突）
DO $$
DECLARE
    pol record;
BEGIN
    -- 刪除所有 public schema 的政策
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- 2. 重新啟用 RLS（確保啟用）
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_log ENABLE ROW LEVEL SECURITY;

-- 3. 建立簡單且不會遞迴的政策

-- users 表：只允許 service_role
CREATE POLICY "users_service_only" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- lessons 表：免費課程公開，其他需要 service_role
CREATE POLICY "lessons_free_read" ON public.lessons
    FOR SELECT USING (is_premium = false);

CREATE POLICY "lessons_service_all" ON public.lessons
    FOR ALL USING (auth.role() = 'service_role');

-- favorites 表：只允許 service_role
CREATE POLICY "favorites_service_only" ON public.favorites
    FOR ALL USING (auth.role() = 'service_role');

-- practice_logs 表：只允許 service_role  
CREATE POLICY "practice_logs_service_only" ON public.practice_logs
    FOR ALL USING (auth.role() = 'service_role');

-- event_log 表：允許插入，service_role 可讀取
CREATE POLICY "event_log_insert_any" ON public.event_log
    FOR INSERT WITH CHECK (true);

CREATE POLICY "event_log_service_read" ON public.event_log
    FOR SELECT USING (auth.role() = 'service_role');

-- 4. 可選表格（如果存在）
DO $$
BEGIN
    -- feedback 表
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback' AND table_schema = 'public') THEN
        ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "feedback_insert_any" ON public.feedback
            FOR INSERT WITH CHECK (true);
        CREATE POLICY "feedback_service_read" ON public.feedback
            FOR SELECT USING (auth.role() = 'service_role');
    END IF;

    -- payments 表
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments' AND table_schema = 'public') THEN
        ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "payments_service_only" ON public.payments
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- 5. 測試基本查詢
SELECT 'RLS 政策重建完成' as status;

-- 6. 檢查結果
SELECT 
    tablename,
    (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
    AND tablename IN ('users', 'lessons', 'favorites', 'practice_logs', 'event_log')
ORDER BY tablename;
