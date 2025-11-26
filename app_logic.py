"""App 邏輯層 - 與 UI 分離，方便測試"""


def filter_lessons(lessons: list, level: str, slope: str, skill: str, search: str) -> list:
    """篩選課程"""
    result = []
    for lesson in lessons:
        # 程度篩選
        if level and level not in lesson.get("level_tags", []):
            continue
        # 雪道篩選
        if slope and slope not in lesson.get("slope_tags", []):
            continue
        # 技能篩選
        if skill and lesson.get("casi", {}).get("Primary_Skill") != skill:
            continue
        # 關鍵字搜尋
        if search:
            blob = " ".join([
                lesson.get("title", ""),
                lesson.get("what", ""),
                " ".join(lesson.get("why", [])),
            ]).lower()
            if search.lower() not in blob:
                continue
        result.append(lesson)
    return result


def get_all_tags(lessons: list) -> tuple:
    """取得所有標籤（去重排序）"""
    levels, slopes, skills = set(), set(), set()
    for lesson in lessons:
        levels.update(lesson.get("level_tags", []))
        slopes.update(lesson.get("slope_tags", []))
        skill = lesson.get("casi", {}).get("Primary_Skill")
        if skill:
            skills.add(skill)
    return sorted(levels), sorted(slopes), sorted(skills)
