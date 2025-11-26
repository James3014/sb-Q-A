"""TDD: 測試 markdown 轉 JSON 轉換器"""
import pytest
import json
from converter import parse_md_file, parse_filename_tags, extract_signals

# === 測試檔名解析 ===

def test_parse_filename_simple():
    """單一 level 和 slope"""
    result = parse_filename_tags("01_滾刃快換刃__L-int__S-blue.md")
    assert result["id"] == "01"
    assert result["level_tags"] == ["intermediate"]
    assert result["slope_tags"] == ["blue"]

def test_parse_filename_multi_level():
    """多個 level"""
    result = parse_filename_tags("02_微站膝換刃__L-beg-int__S-green-blue.md")
    assert result["id"] == "02"
    assert result["level_tags"] == ["beginner", "intermediate"]
    assert result["slope_tags"] == ["green", "blue"]

def test_parse_filename_advanced():
    """進階 + 多雪道"""
    result = parse_filename_tags("08_蘑菇上轉__L-adv__S-blue-black-mogul.md")
    assert result["id"] == "08"
    assert result["level_tags"] == ["advanced"]
    assert result["slope_tags"] == ["blue", "black", "mogul"]

# === 測試訊號提取 ===

def test_extract_signals_from_drill_how():
    """從 Drill_How 提取做對/做錯訊號"""
    text = "練習方法說明。做對訊號：身體擺動變小、換刃無頓挫；做錯訊號：壓到腳尖、起身太多。"
    signals = extract_signals(text)
    assert "身體擺動變小" in signals["correct"]
    assert "壓到腳尖" in signals["wrong"]

def test_extract_signals_empty():
    """沒有訊號時回傳空"""
    text = "只有練習方法，沒有訊號。"
    signals = extract_signals(text)
    assert signals["correct"] == []
    assert signals["wrong"] == []

# === 測試完整解析 ===

SAMPLE_MD = '''# 01 滾刃快換刃：少站直縮小弧度

## 📝 教學內容

### 問題描述 (What)

換刃時弧度大、換刃時間長。

### 改善目標 (Why)

- 縮小弧度
- 提升效率

### 改善方法 (How)

**核心：換刃時只微起身**

1. 站姿控制
2. 壓力分佈

**關鍵提示**：
- 做對時身體擺動變小

### 適合對象 / 雪道
- 程度：中級
- 雪道：藍道

---

## 🎯 CASI 結構化數據

```json
{
  "Primary_Skill": "用刃",
  "Core_Competency": "居中且靈活的站姿",
  "Advanced_Competency": null,
  "Fault_What": "換刃弧度大",
  "Goal_Why": "縮小弧度提升效率",
  "Drill_How": "換刃時微起身。做對訊號：擺動變小；做錯訊號：起身太多。",
  "CASI_Skill": ["用刃"]
}
```
'''

def test_parse_md_file_basic():
    """測試完整 markdown 解析"""
    result = parse_md_file(SAMPLE_MD, "01_滾刃快換刃__L-int__S-blue.md")
    
    assert result["id"] == "01"
    assert result["title"] == "滾刃快換刃：少站直縮小弧度"
    assert result["level_tags"] == ["intermediate"]
    assert result["slope_tags"] == ["blue"]
    assert "弧度大" in result["what"]
    assert len(result["why"]) >= 1
    assert len(result["how"]) >= 1
    assert result["casi"]["Primary_Skill"] == "用刃"
    assert "擺動變小" in result["signals"]["correct"]

def test_parse_md_file_how_structure():
    """How 應該是 list of dict，支援未來圖片"""
    result = parse_md_file(SAMPLE_MD, "01_滾刃快換刃__L-int__S-blue.md")
    
    assert isinstance(result["how"], list)
    assert isinstance(result["how"][0], dict)
    assert "text" in result["how"][0]
    assert "image" in result["how"][0]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
