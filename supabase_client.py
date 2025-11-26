"""Supabase client - 支援 fallback 到本地 JSON"""
import os
import json
from pathlib import Path

# 嘗試載入 supabase，失敗則用 fallback
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False

_client = None


def get_client():
    """取得 Supabase client，無設定則回傳 None"""
    global _client
    if _client:
        return _client
    
    if not SUPABASE_AVAILABLE:
        return None
    
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        return None
    
    try:
        _client = create_client(url, key)
        return _client
    except Exception:
        return None


def fetch_lessons(premium_only=None):
    """取得 lessons - 直接用本地 JSON（Supabase lessons 表暫不使用）"""
    # 直接讀取本地 JSON
    path = Path(__file__).parent / "lessons.json"
    if path.exists():
        data = json.loads(path.read_text(encoding="utf-8"))
        if premium_only is True:
            return [l for l in data if l.get("is_premium")]
        elif premium_only is False:
            return [l for l in data if not l.get("is_premium")]
        return data
    
    return []


def get_lesson_by_id(lesson_id: str):
    """取得單一 lesson"""
    client = get_client()
    
    if client:
        try:
            result = client.table("lessons").select("*").eq("id", lesson_id).single().execute()
            return result.data
        except Exception:
            pass
    
    # Fallback
    lessons = fetch_lessons()
    return next((l for l in lessons if l["id"] == lesson_id), None)


# ============================================
# 收藏功能
# ============================================

def add_favorite(user_id: str, lesson_id: str):
    """加入收藏"""
    client = get_client()
    if not client:
        return {"error": "需要登入"}
    try:
        client.table("favorites").insert({"user_id": user_id, "lesson_id": lesson_id}).execute()
        return {"success": True}
    except Exception as e:
        return {"error": str(e)}


def remove_favorite(user_id: str, lesson_id: str):
    """移除收藏"""
    client = get_client()
    if not client:
        return {"error": "需要登入"}
    try:
        client.table("favorites").delete().eq("user_id", user_id).eq("lesson_id", lesson_id).execute()
        return {"success": True}
    except Exception as e:
        return {"error": str(e)}


def get_favorites(user_id: str):
    """取得用戶的收藏列表（回傳 lesson_id 列表）"""
    client = get_client()
    if not client:
        return []
    try:
        result = client.table("favorites").select("lesson_id").eq("user_id", user_id).execute()
        return [f["lesson_id"] for f in result.data]
    except Exception:
        return []
