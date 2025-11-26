-- 修正 users 表的 RLS 政策
-- 問題：缺少 INSERT 政策，導致 trigger 無法插入新用戶

-- 1. 刪除舊政策（如果存在）
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;

-- 2. 重新建立政策
CREATE POLICY "users_read_own" ON users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- 3. 允許 service role 插入（給 trigger 用）
CREATE POLICY "users_insert_service" ON users 
  FOR INSERT 
  WITH CHECK (true);

-- 4. 確認 trigger 函數有 SECURITY DEFINER
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
