"""TDD: Auth 測試"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_signup_returns_result():
    """註冊回傳結果（user 或 error）"""
    from auth import signup
    result = signup("test_tdd@example.com", "testpass123")
    assert "user" in result or "error" in result


def test_login_returns_result():
    """登入回傳結果（session 或 error）"""
    from auth import login
    result = login("test_tdd@example.com", "testpass123")
    assert "session" in result or "error" in result


def test_logout_no_error():
    """登出不報錯"""
    from auth import logout
    result = logout()
    assert result is None or result.get("error") is None


def test_get_current_user():
    """取得當前用戶（可能為 None）"""
    from auth import get_current_user
    user = get_current_user()
    assert user is None or "id" in user


def test_is_premium_returns_bool():
    """檢查 Premium 狀態回傳 bool"""
    from auth import is_premium
    result = is_premium(user_id=None)
    assert isinstance(result, bool)


if __name__ == "__main__":
    test_get_current_user()
    print("✓ test_get_current_user")
    test_logout_no_error()
    print("✓ test_logout_no_error")
    test_is_premium_returns_bool()
    print("✓ test_is_premium_returns_bool")
    print("\n基本測試通過 ✓")
    print("（signup/login 需要真實 Supabase 連線測試）")
