#!/usr/bin/env python3
"""
手動添加13個新處理檔案的對應關係
"""

import json

# 手動建立的對應關係（基於我處理時的記錄）
manual_mappings = [
    {"source_file": "转弯时候的\"转\"先转还是后转？.txt", "cleaned_id": 222, "cleaned_file": "222_轉彎先降後轉建立抓地__L-adv__S-blue-black.md"},
    {"source_file": "基础：转弯别\"掰\"弯.txt", "cleaned_id": 215, "cleaned_file": "215_後腳送轉別掰髖__L-adv__S-powder.md"},
    {"source_file": "进阶： 被动倾倒.txt", "cleaned_id": 219, "cleaned_file": "219_被動傾倒折疊控刃__L-adv__S-all.md"},
    {"source_file": "21一个练习：改你肩带转.txt", "cleaned_id": 212, "cleaned_file": "212_Apex跳戒肩轉__L-adv__S-park.md"},
    {"source_file": "试试让你的膝盖这么\"转\".txt", "cleaned_id": 218, "cleaned_file": "218_膝隨髖轉牛仔站姿__L-adv__S-all.md"},
    {"source_file": "如果让我选5种板型.txt", "cleaned_id": 213, "cleaned_file": "213_五種板型選擇建議__L-adv__S-park.md"},
    {"source_file": "第一出道外：试试练习这三个阶段.txt", "cleaned_id": 224, "cleaned_file": "224_道外入門三階段__L-adv__S-park.md"},
    {"source_file": "弯末压力释放（late pressure release）.txt", "cleaned_id": 214, "cleaned_file": "214_彎末壓力釋放練習__L-adv__S-all.md"},
    {"source_file": "浅聊：你其实转的不是你的膝盖，而是….txt", "cleaned_id": 223, "cleaned_file": "223_轉髖不轉膝生物力學__L-adv__S-all.md"},
    {"source_file": "15水泥粉里不摔跤小技巧.txt", "cleaned_id": 216, "cleaned_file": "216_水泥粉開髖後坐搖板頭__L-adv__S-powder.md"},
    {"source_file": "进阶：视线别再看两侧了.txt", "cleaned_id": 220, "cleaned_file": "220_視線山下反擰縮彎__L-adv__S-all.md"},
    {"source_file": "基础到进阶： \"起降\"概念.txt", "cleaned_id": 221, "cleaned_file": "221_起降概念起才減速__L-adv__S-all.md"},
    {"source_file": "进阶： 背部夹紧增加旋转.txt", "cleaned_id": 217, "cleaned_file": "217_背部夾緊增旋轉力__L-adv__S-all.md"}
]

# 讀取現有對應表
with open('complete_sam_cleaned_mapping.json', 'r') as f:
    complete_mapping = json.load(f)

print("="*70)
print("添加13個新處理檔案的對應關係")
print("="*70)

# 添加這13個對應
for item in manual_mappings:
    complete_mapping['mappings'].append({
        'source_file': item['source_file'],
        'cleaned_file': item['cleaned_file'],
        'cleaned_id': item['cleaned_id'],
        'match_type': 'newly_processed',
        'confidence': 1.0
    })
    print(f"[{item['cleaned_id']}] {item['source_file'][:50]:50s} → {item['cleaned_file'][:50]}")

# 重新排序
complete_mapping['mappings'].sort(key=lambda x: x['cleaned_id'])

# 更新統計
complete_mapping['total_mappings'] = len(complete_mapping['mappings'])
complete_mapping['by_type']['newly_processed'] = 13

print(f"\n總對應數: {complete_mapping['total_mappings']}")

# 儲存更新後的對應表
with open('complete_sam_cleaned_mapping.json', 'w', encoding='utf-8') as f:
    json.dump(complete_mapping, f, ensure_ascii=False, indent=2)

print(f"完整對應表已更新至: complete_sam_cleaned_mapping.json")

# 重新生成CSV
import csv
with open('sam_cleaned_mapping.csv', 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.DictWriter(f, fieldnames=['cleaned_id', 'cleaned_file', 'source_file', 'match_type', 'confidence'])
    writer.writeheader()
    writer.writerows(complete_mapping['mappings'])

print(f"CSV對應表已更新至: sam_cleaned_mapping.csv")

# 檢查還缺多少
all_cleaned_ids = set(item['cleaned_id'] for item in complete_mapping['mappings'])
expected_ids = set(range(1, 225)) - {65, 167, 168, 169, 170, 171, 172, 173, 174, 175, 205}
missing_ids = expected_ids - all_cleaned_ids

print(f"\n還缺失的cleaned_id數: {len(missing_ids)}")
if len(missing_ids) <= 20:
    print(f"缺失的ID: {sorted(missing_ids)}")
