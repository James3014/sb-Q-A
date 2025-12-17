-- 修復 Supabase 安全警告 - 版本 2
-- 先建立必要的函數，再建立政策

-- 1. 建立訂閱檢查函數（如果不存在）
CREATE OR REPLACE FUNCTION public.is_subscription_active(p_user uuid)
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = p_user
      AND COALESCE(u.subscription_type, 'free') <> 'free'
      AND (u.subscription_expires_at IS NULL OR u.subscription_expires_at > NOW())
  );
$$;

-- 2. 確保所有主要表格啟用 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_log ENABLE ROW LEVEL SECURITY;

-- 如果表格存在才啟用 RLS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback') THEN
        ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'affiliate_partners') THEN
        ALTER TABLE public.affiliate_partners ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'affiliate_clicks') THEN
        ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'affiliate_commissions') THEN
        ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 3. 刪除可能存在的舊政策（避免衝突）
DROP POLICY IF EXISTS "users_self_select" ON public.users;
DROP POLICY IF EXISTS "users_admin_select" ON public.users;
DROP POLICY IF EXISTS "lessons_free_select" ON public.lessons;
DROP POLICY IF EXISTS "lessons_premium_select" ON public.lessons;
DROP POLICY IF EXISTS "lessons_admin_all" ON public.lessons;
DROP POLICY IF EXISTS "favorites_self_all" ON public.favorites;
DROP POLICY IF EXISTS "practice_logs_self_all" ON public.practice_logs;
DROP POLICY IF EXISTS "event_log_insert_limited" ON public.event_log;
DROP POLICY IF EXISTS "event_log_self_select" ON public.event_log;

-- 4. 建立基本政策

-- users 表政策
CREATE POLICY "users_self_select" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_admin_select" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.is_admin = true
        )
    );

-- lessons 表政策
CREATE POLICY "lessons_free_select" ON public.lessons
    FOR SELECT USING (is_premium = false);

CREATE POLICY "lessons_premium_select" ON public.lessons
    FOR SELECT USING (
        is_premium = true AND 
        public.is_subscription_active(auth.uid())
    );

CREATE POLICY "lessons_admin_all" ON public.lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.is_admin = true
        )
    );

-- favorites 表政策
CREATE POLICY "favorites_self_all" ON public.favorites
    FOR ALL USING (
        auth.uid() = user_id AND 
        public.is_subscription_active(auth.uid())
    );

-- practice_logs 表政策
CREATE POLICY "practice_logs_self_all" ON public.practice_logs
    FOR ALL USING (
        auth.uid() = user_id AND 
        public.is_subscription_active(auth.uid())
    );

-- event_log 表政策
CREATE POLICY "event_log_insert_limited" ON public.event_log
    FOR INSERT WITH CHECK (true);

CREATE POLICY "event_log_self_select" ON public.event_log
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.is_admin = true
        )
    );

-- 5. 可選表格的政策（如果表格存在）
DO $$
BEGIN
    -- feedback 表
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback') THEN
        DROP POLICY IF EXISTS "feedback_insert_any" ON public.feedback;
        DROP POLICY IF EXISTS "feedback_admin_select" ON public.feedback;
        
        CREATE POLICY "feedback_insert_any" ON public.feedback
            FOR INSERT WITH CHECK (true);
            
        CREATE POLICY "feedback_admin_select" ON public.feedback
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.users u 
                    WHERE u.id = auth.uid() AND u.is_admin = true
                )
            );
    END IF;

    -- payments 表
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        DROP POLICY IF EXISTS "payments_self_select" ON public.payments;
        
        CREATE POLICY "payments_self_select" ON public.payments
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- 6. 檢查結果
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
    AND tablename IN ('users', 'lessons', 'favorites', 'practice_logs', 'event_log')
ORDER BY tablename;

-- 完成訊息
SELECT 'RLS 安全修復完成！' as status;
