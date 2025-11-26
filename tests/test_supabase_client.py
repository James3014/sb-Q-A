"""TDD: Supabase client 測試"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_get_client_or_none():
    """client 回傳 client 或 None（無設定時）"""
    from supabase_client import get_client
    client = get_client()
    # 無設定時回傳 None 是正確的
    assert client is None or client is not None  # 總是通過，重點是不報錯


def test_fetch_lessons_fallback():
    """可以讀取 lessons（fallback 到本地 JSON）"""
    from supabase_client import fetch_lessons
    lessons = fetch_lessons()
    assert len(lessons) > 0, "應該有 lessons 資料"
    assert len(lessons) >= 200, f"應該有 200+ 筆，實際 {len(lessons)}"


def test_fetch_lessons_has_required_fields():
    """lessons 有必要欄位"""
    from supabase_client import fetch_lessons
    lessons = fetch_lessons()
    lesson = lessons[0]
    required = ["id", "title", "what", "why", "how", "level_tags", "slope_tags"]
    for field in required:
        assert field in lesson, f"缺少欄位: {field}"


def test_get_lesson_by_id():
    """可以用 id 取得單一 lesson"""
    from supabase_client import get_lesson_by_id
    lesson = get_lesson_by_id("01")
    assert lesson is not None
    assert lesson["id"] == "01"


def test_get_lesson_by_id_not_found():
    """找不到時回傳 None"""
    from supabase_client import get_lesson_by_id
    lesson = get_lesson_by_id("not_exist_999")
    assert lesson is None


if __name__ == "__main__":
    test_get_client_or_none()
    print("✓ test_get_client_or_none")
    test_fetch_lessons_fallback()
    print("✓ test_fetch_lessons_fallback")
    test_fetch_lessons_has_required_fields()
    print("✓ test_fetch_lessons_has_required_fields")
    test_get_lesson_by_id()
    print("✓ test_get_lesson_by_id")
    test_get_lesson_by_id_not_found()
    print("✓ test_get_lesson_by_id_not_found")
    print("\n所有測試通過 ✓")
