"""TDD: 測試 app 資料處理邏輯"""
from app_logic import filter_lessons, get_all_tags

SAMPLE_DATA = [
    {
        "id": "01",
        "title": "滾刃快換刃",
        "level_tags": ["intermediate"],
        "slope_tags": ["blue"],
        "what": "換刃弧度大",
        "casi": {"Primary_Skill": "用刃"}
    },
    {
        "id": "02", 
        "title": "微站膝換刃",
        "level_tags": ["beginner", "intermediate"],
        "slope_tags": ["green", "blue"],
        "what": "下半身帶不動",
        "casi": {"Primary_Skill": "站姿與平衡"}
    },
    {
        "id": "08",
        "title": "蘑菇上轉",
        "level_tags": ["advanced"],
        "slope_tags": ["blue", "black", "mogul"],
        "what": "蘑菇控速",
        "casi": {"Primary_Skill": "旋轉"}
    }
]

def test_filter_no_filter():
    """無篩選回傳全部"""
    result = filter_lessons(SAMPLE_DATA, None, None, None, "")
    assert len(result) == 3

def test_filter_by_level():
    """篩選程度"""
    result = filter_lessons(SAMPLE_DATA, "beginner", None, None, "")
    assert len(result) == 1
    assert result[0]["id"] == "02"

def test_filter_by_slope():
    """篩選雪道"""
    result = filter_lessons(SAMPLE_DATA, None, "mogul", None, "")
    assert len(result) == 1
    assert result[0]["id"] == "08"

def test_filter_by_skill():
    """篩選技能"""
    result = filter_lessons(SAMPLE_DATA, None, None, "用刃", "")
    assert len(result) == 1
    assert result[0]["id"] == "01"

def test_filter_by_search():
    """關鍵字搜尋"""
    result = filter_lessons(SAMPLE_DATA, None, None, None, "蘑菇")
    assert len(result) == 1
    assert result[0]["id"] == "08"

def test_filter_combined():
    """組合篩選"""
    result = filter_lessons(SAMPLE_DATA, "intermediate", "blue", None, "")
    assert len(result) == 2  # 01 和 02 都符合

def test_get_all_tags():
    """取得所有標籤"""
    levels, slopes, skills = get_all_tags(SAMPLE_DATA)
    assert "beginner" in levels
    assert "mogul" in slopes
    assert "用刃" in skills


if __name__ == "__main__":
    test_filter_no_filter()
    print("✓ test_filter_no_filter")
    test_filter_by_level()
    print("✓ test_filter_by_level")
    test_filter_by_slope()
    print("✓ test_filter_by_slope")
    test_filter_by_skill()
    print("✓ test_filter_by_skill")
    test_filter_by_search()
    print("✓ test_filter_by_search")
    test_filter_combined()
    print("✓ test_filter_combined")
    test_get_all_tags()
    print("✓ test_get_all_tags")
    print("\n所有測試通過 ✓")
