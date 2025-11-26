#!/usr/bin/env python3
"""
批次整理119個可能未引用的原始稿
使用與之前相同的AI整理流程
"""

import json
import os
import sys
from pathlib import Path
import anthropic

# 讀取未引用的原始稿清單
with open('unreferenced_sources.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    unreferenced_files = data['unreferenced_files']

print(f"="*70)
print(f"批次整理未引用的原始稿")
print(f"="*70)
print(f"總數: {len(unreferenced_files)} 個")
print()

# 初始化Anthropic客戶端
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# 系統提示詞（與之前相同）
SYSTEM_PROMPT = """你是滑雪教練的助手，負責將口語化的教學逐字稿整理成結構化的教學內容。

請將逐字稿整理成以下格式的Markdown檔案：

# [編號] [簡潔標題]

## 📝 教學內容

### 問題描述 (What)
[學生常見的技術問題，1-2句話]

### 改善目標 (Why)
- [改善這個問題的目的或好處]

### 改善方法 (How)
- [具體的動作要點或練習步驟]

## 🎯 CASI 結構化數據

```json
{
  "Core_Competency": "[CASI核心能力]",
  "Advanced_Competency": "[進階能力，可選]",
  "Fault_What": "[問題的精簡描述]",
  "Goal_Why": "[改善目標]",
  "Drill_How": "[練習方法的完整描述，包含做對做錯訊號]",
  "CASI_Skill": ["[主要技能]"],
  "Primary_Skill": "[主要技能]"
}
```

CASI 五項核心技能：
1. 站姿與平衡
2. 旋轉
3. 用刃
4. 壓力
5. 時機與協調性

重要：
- 標題要簡潔有力
- 問題描述要精準
- JSON中的Drill_How要包含完整內容
- 保持專業但易懂的語氣
"""

def process_transcript(file_path, output_dir='sam_cleaned_new'):
    """處理單個逐字稿"""
    filename = Path(file_path).name

    try:
        # 讀取逐字稿
        with open(file_path, 'r', encoding='utf-8') as f:
            transcript = f.read()

        # 呼叫Claude API
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4000,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"請整理以下逐字稿:\n\n{transcript}"
                }
            ]
        )

        # 提取回應
        cleaned_content = message.content[0].text

        # 加入source_file資訊到JSON
        # 找到JSON區塊並加入source_file
        if '```json' in cleaned_content:
            json_start = cleaned_content.find('```json') + 7
            json_end = cleaned_content.find('```', json_start)
            json_str = cleaned_content[json_start:json_end].strip()
            json_data = json.loads(json_str)

            # 加入來源資訊
            import hashlib
            with open(file_path, 'rb') as f:
                checksum = hashlib.md5(f.read()).hexdigest()[:12]

            json_data['source_file'] = filename
            json_data['source_checksum'] = checksum
            json_data['match_confidence'] = 1.0  # 直接整理，100%信心

            # 重新生成JSON
            new_json = json.dumps(json_data, ensure_ascii=False, indent=2)
            cleaned_content = cleaned_content[:json_start] + new_json + '\n' + cleaned_content[json_end:]

        # 儲存到新目錄
        os.makedirs(output_dir, exist_ok=True)

        # 暫時使用原始檔名作為輸出檔名（之後會重新編號）
        output_filename = filename.replace('.txt', '.md')
        output_path = os.path.join(output_dir, output_filename)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(cleaned_content)

        return 'success', output_path

    except Exception as e:
        return 'error', str(e)

# 主程序
def main():
    processed = 0
    errors = []

    for i, filename in enumerate(unreferenced_files, 1):
        file_path = f"sam/{filename}"

        if not os.path.exists(file_path):
            print(f"[{i:3d}/{len(unreferenced_files)}] ✗ 檔案不存在: {filename}")
            errors.append((filename, '檔案不存在'))
            continue

        print(f"[{i:3d}/{len(unreferenced_files)}] 處理中: {filename[:50]}...")

        status, result = process_transcript(file_path)

        if status == 'success':
            processed += 1
            print(f"                      ✓ 完成")
        else:
            errors.append((filename, result))
            print(f"                      ✗ 錯誤: {result}")

    print("\n" + "="*70)
    print("處理完成")
    print("="*70)
    print(f"成功: {processed}/{len(unreferenced_files)}")
    print(f"錯誤: {len(errors)}")

    if errors:
        print("\n錯誤清單:")
        for filename, error in errors[:10]:
            print(f"  - {filename}: {error}")

    print(f"\n新整理的檔案位於: sam_cleaned_new/")
    print("下一步: 比對這些檔案與現有200個，刪除重複的")

if __name__ == '__main__':
    main()
