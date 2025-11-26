"""Auth 模組 - 登入/註冊/Premium 狀態"""
from supabase_client import get_client

_current_session = None


def signup(email: str, password: str) -> dict:
    """註冊新用戶 - 只用 auth.users，不依賴 public.users"""
    client = get_client()
    if not client:
        return {"error": "Supabase 未設定"}
    
    try:
        result = client.auth.sign_up({"email": email, "password": password})
        if result.user:
            return {"user": {"id": str(result.user.id), "email": result.user.email}}
        return {"error": "註冊失敗"}
    except Exception as e:
        return {"error": str(e)}


def login(email: str, password: str) -> dict:
    """登入"""
    global _current_session
    client = get_client()
    if not client:
        return {"error": "Supabase 未設定"}
    
    try:
        result = client.auth.sign_in_with_password({"email": email, "password": password})
        _current_session = result.session
        if result.user:
            return {"user": {"id": str(result.user.id), "email": result.user.email}}
        return {"error": "登入失敗"}
    except Exception as e:
        return {"error": str(e)}


def logout() -> dict:
    """登出"""
    global _current_session
    _current_session = None
    client = get_client()
    if client:
        try:
            client.auth.sign_out()
        except Exception:
            pass
    return None


def get_current_user() -> dict:
    """取得當前登入用戶"""
    global _current_session
    if not _current_session:
        return None
    client = get_client()
    if not client:
        return None
    try:
        user = client.auth.get_user(_current_session.access_token)
        if user.user:
            return {"id": str(user.user.id), "email": user.user.email}
    except Exception:
        pass
    return None


def is_premium(user_id: str = None) -> bool:
    """檢查用戶是否為 Premium - 暫時回傳 False"""
    # TODO: 之後再實作 premium 檢查
    return False
