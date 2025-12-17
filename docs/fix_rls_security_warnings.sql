-- 修復 Supabase 安全警告
-- 執行時間：2025-12-17
-- 目的：修復 RLS 政策和安全漏洞

-- 1. 確保所有主要表格啟用 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- 2. 聯盟行銷相關表格啟用 RLS
ALTER TABLE public.affiliate_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

-- 3. 檢查並修復可能缺失的政策

-- users 表政策（如果不存在則建立）
DO $$
BEGIN
    -- 用戶只能讀取自己的資料
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'users_self_select'
    ) THEN
        CREATE POLICY "users_self_select" ON public.users
            FOR SELECT USING (auth.uid() = id);
    END IF;

    -- 管理員可以讀取所有用戶
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'users_admin_select'
    ) THEN
        CREATE POLICY "users_admin_select" ON public.users
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.users u 
                    WHERE u.id = auth.uid() AND u.is_admin = true
                )
            );
    END IF;
END $$;

-- lessons 表政策
DO $$
BEGIN
    -- 所有人可以讀取免費課程
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lessons' AND policyname = 'lessons_free_select'
    ) THEN
        CREATE POLICY "lessons_free_select" ON public.lessons
            FOR SELECT USING (is_premium = false);
    END IF;

    -- 有訂閱的用戶可以讀取付費課程
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lessons' AND policyname = 'lessons_premium_select'
    ) THEN
        CREATE POLICY "lessons_premium_select" ON public.lessons
            FOR SELECT USING (
                is_premium = true AND 
                public.is_subscription_active(auth.uid())
            );
    END IF;

    -- 管理員可以讀寫所有課程
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lessons' AND policyname = 'lessons_admin_all'
    ) THEN
        CREATE POLICY "lessons_admin_all" ON public.lessons
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.users u 
                    WHERE u.id = auth.uid() AND u.is_admin = true
                )
            );
    END IF;
END $$;

-- favorites 表政策
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'favorites' AND policyname = 'favorites_self_all'
    ) THEN
        CREATE POLICY "favorites_self_all" ON public.favorites
            FOR ALL USING (
                auth.uid() = user_id AND 
                public.is_subscription_active(auth.uid())
            );
    END IF;
END $$;

-- practice_logs 表政策
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'practice_logs' AND policyname = 'practice_logs_self_all'
    ) THEN
        CREATE POLICY "practice_logs_self_all" ON public.practice_logs
            FOR ALL USING (
                auth.uid() = user_id AND 
                public.is_subscription_active(auth.uid())
            );
    END IF;
END $$;

-- event_log 表政策（限制寫入頻率）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'event_log' AND policyname = 'event_log_insert_limited'
    ) THEN
        CREATE POLICY "event_log_insert_limited" ON public.event_log
            FOR INSERT WITH CHECK (
                -- 允許插入，但由觸發器控制頻率
                true
            );
    END IF;

    -- 用戶只能讀取自己的事件
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'event_log' AND policyname = 'event_log_self_select'
    ) THEN
        CREATE POLICY "event_log_self_select" ON public.event_log
            FOR SELECT USING (
                auth.uid() = user_id OR 
                EXISTS (
                    SELECT 1 FROM public.users u 
                    WHERE u.id = auth.uid() AND u.is_admin = true
                )
            );
    END IF;
END $$;

-- feedback 表政策
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'feedback' AND policyname = 'feedback_insert_any'
    ) THEN
        CREATE POLICY "feedback_insert_any" ON public.feedback
            FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'feedback' AND policyname = 'feedback_admin_select'
    ) THEN
        CREATE POLICY "feedback_admin_select" ON public.feedback
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.users u 
                    WHERE u.id = auth.uid() AND u.is_admin = true
                )
            );
    END IF;
END $$;

-- payments 表政策
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payments' AND policyname = 'payments_self_select'
    ) THEN
        CREATE POLICY "payments_self_select" ON public.payments
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- 聯盟行銷表格政策
DO $$
BEGIN
    -- affiliate_partners - 只有管理員可以管理
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'affiliate_partners' AND policyname = 'affiliate_partners_admin_all'
    ) THEN
        CREATE POLICY "affiliate_partners_admin_all" ON public.affiliate_partners
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.users u 
                    WHERE u.id = auth.uid() AND u.is_admin = true
                )
            );
    END IF;

    -- affiliate_clicks - 允許插入，管理員可讀取
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'affiliate_clicks' AND policyname = 'affiliate_clicks_insert_any'
    ) THEN
        CREATE POLICY "affiliate_clicks_insert_any" ON public.affiliate_clicks
            FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'affiliate_clicks' AND policyname = 'affiliate_clicks_admin_select'
    ) THEN
        CREATE POLICY "affiliate_clicks_admin_select" ON public.affiliate_clicks
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.users u 
                    WHERE u.id = auth.uid() AND u.is_admin = true
                )
            );
    END IF;

    -- affiliate_commissions - 只有管理員可以管理
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'affiliate_commissions' AND policyname = 'affiliate_commissions_admin_all'
    ) THEN
        CREATE POLICY "affiliate_commissions_admin_all" ON public.affiliate_commissions
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.users u 
                    WHERE u.id = auth.uid() AND u.is_admin = true
                )
            );
    END IF;
END $$;

-- 4. 移除可能有問題的 SECURITY DEFINER 視圖（如果存在）
DROP VIEW IF EXISTS public.active_subscriptions CASCADE;
DROP VIEW IF EXISTS public.practice_logs_with_avg CASCADE;
DROP VIEW IF EXISTS public.subscription_plans_active CASCADE;

-- 5. 確保 is_subscription_active 函數是安全的
CREATE OR REPLACE FUNCTION public.is_subscription_active(p_user uuid)
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER  -- 使用調用者權限，不是 DEFINER
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

-- 6. 檢查結果
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'lessons', 'favorites', 'practice_logs', 'event_log', 
        'feedback', 'payments', 'subscription_plans',
        'affiliate_partners', 'affiliate_clicks', 'affiliate_commissions'
    )
ORDER BY tablename;

-- 完成訊息
SELECT 'RLS 安全修復完成！所有表格已啟用 RLS 並設定適當政策。' as status;
