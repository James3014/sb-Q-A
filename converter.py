"""Markdown 轉 JSON 轉換器 - Linus 原則：簡單、少分支"""
import re
import json
from pathlib import Path

# 標籤映射
LEVEL_MAP = {"beg": "beginner", "int": "intermediate", "adv": "advanced"}


def parse_filename_tags(filename: str) -> dict:
    """從檔名解析 id, level_tags, slope_tags"""
    name = Path(filename).stem
    
    # 解析 id
    id_match = re.match(r"(\d+)", name)
    file_id = id_match.group(1) if id_match else ""
    
    # 解析 level: L-beg-int → ["beginner", "intermediate"]
    level_match = re.search(r"L-([a-z-]+)", name)
    level_tags = []
    if level_match:
        for tag in level_match.group(1).split("-"):
            level_tags.append(LEVEL_MAP.get(tag, tag))
    
    # 解析 slope: S-blue-black → ["blue", "black"]
    slope_match = re.search(r"S-([a-z-]+)", name)
    slope_tags = slope_match.group(1).split("-") if slope_match else []
    
    return {"id": file_id, "level_tags": level_tags, "slope_tags": slope_tags}


def extract_signals(text: str) -> dict:
    """從 Drill_How 提取做對/做錯訊號"""
    correct, wrong = [], []
    
    # 做對訊號
    m = re.search(r"做對訊號[：:]\s*([^；;]+)", text)
    if m:
        correct = [s.strip() for s in re.split(r"[、,]", m.group(1)) if s.strip()]
    
    # 做錯訊號
    m = re.search(r"做錯訊號[：:]\s*([^。]+)", text)
    if m:
        wrong = [s.strip() for s in re.split(r"[、,]", m.group(1)) if s.strip()]
    
    return {"correct": correct, "wrong": wrong}


def parse_md_file(content: str, filename: str) -> dict:
    """解析 markdown 內容，回傳結構化 JSON"""
    result = parse_filename_tags(filename)
    
    # 標題
    title_match = re.search(r"^# \d+\s+(.+)$", content, re.MULTILINE)
    result["title"] = title_match.group(1).strip() if title_match else ""
    
    # What: 問題描述
    what_match = re.search(r"### 問題描述.*?\n\n(.+?)(?=\n###|\n---)", content, re.DOTALL)
    result["what"] = what_match.group(1).strip() if what_match else ""
    
    # Why: 改善目標（提取列表項）
    why_match = re.search(r"### 改善目標.*?\n\n(.+?)(?=\n###|\n---)", content, re.DOTALL)
    result["why"] = []
    if why_match:
        for line in why_match.group(1).split("\n"):
            line = re.sub(r"^[-*]\s*", "", line.strip())
            if line and not line.startswith("#"):
                result["why"].append(line)
    
    # How: 改善方法（轉成 list of dict）
    how_match = re.search(r"### 改善方法.*?\n\n(.+?)(?=\n### 適合|\n---)", content, re.DOTALL)
    result["how"] = []
    if how_match:
        for line in how_match.group(1).split("\n"):
            line = line.strip()
            if line and not line.startswith("#"):
                result["how"].append({"text": line, "image": None})
    
    # CASI JSON
    json_match = re.search(r"```json\s*(\{.+?\})\s*```", content, re.DOTALL)
    casi = {}
    if json_match:
        casi = json.loads(json_match.group(1))
    
    result["casi"] = {
        "Primary_Skill": casi.get("Primary_Skill", ""),
        "Core_Competency": casi.get("Core_Competency", ""),
        "Advanced_Competency": casi.get("Advanced_Competency"),
    }
    
    # 訊號
    result["signals"] = extract_signals(casi.get("Drill_How", ""))
    
    return result


def convert_all(input_dir: str, output_file: str, pattern: str = "*.md"):
    """批次轉換目錄下所有 md 檔案"""
    input_path = Path(input_dir)
    results = []
    
    for md_file in sorted(input_path.glob(pattern)):
        # 跳過非教學文件
        if not re.match(r"\d+_", md_file.name):
            continue
        
        content = md_file.read_text(encoding="utf-8")
        result = parse_md_file(content, md_file.name)
        results.append(result)
    
    Path(output_file).write_text(
        json.dumps(results, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    return len(results)


if __name__ == "__main__":
    count = convert_all("sam_cleaned", "lessons.json")
    print(f"轉換完成: {count} 個檔案")
