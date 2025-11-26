"""Auth 模組 - 登入/註冊/Premium 狀態"""
from supabase_client import get_client
import traceback

_current_session = None


def signup(email: str, password: str) -> dict:
    """註冊新用戶"""
    client = get_client()
    if not client:
        return {"error": "Supabase 未設定（環境變數缺失）"}
    
    try:
        # 1. 註冊 auth
        result = client.auth.sign_up({"email": email, "password": password})
        if not result.user:
            return {"error": "註冊失敗"}
        
        # 2. 直接在程式碼建立 user 記錄（不靠 trigger）
        try:
            client.table("users").insert({
                "id": str(result.user.id),
                "email": result.user.email,
                "is_premium": False
            }).execute()
        except Exception as e:
            # 如果 user 已存在就忽略
            pass
        
        return {"user": {"id": str(result.user.id), "email": result.user.email}}
    except Exception as e:
        error_msg = str(e)
        if "Invalid API key" in error_msg:
            return {"error": f"API Key 錯誤 - 請檢查 Zeabur 環境變數 SUPABASE_KEY 是否正確"}
        return {"error": f"{error_msg}"}


def login(email: str, password: str) -> dict:
    """登入"""
    global _current_session
    client = get_client()
    if not client:
        return {"error": "Supabase 未設定（環境變數缺失）"}
    
    try:
        result = client.auth.sign_in_with_password({"email": email, "password": password})
        _current_session = result.session
        user_dict = {"id": result.user.id, "email": result.user.email} if result.user else None
        return {"session": result.session, "user": user_dict}
    except Exception as e:
        error_msg = str(e)
        if "Invalid API key" in error_msg:
            return {"error": f"API Key 錯誤 - 請檢查 Zeabur 環境變數 SUPABASE_KEY 是否正確"}
        return {"error": f"{error_msg}"}


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
    client = get_client()
    if not client or not _current_session:
        return None
    try:
        user = client.auth.get_user(_current_session.access_token)
        return {"id": user.user.id, "email": user.user.email} if user.user else None
    except Exception:
        return None


def is_premium(user_id: str = None) -> bool:
    """檢查用戶是否為 Premium"""
    if not user_id:
        return False
    
    client = get_client()
    if not client:
        return False
    
    try:
        result = client.table("users").select("is_premium, premium_until").eq("id", user_id).single().execute()
        if result.data:
            return result.data.get("is_premium", False)
    except Exception:
        pass
    return False
