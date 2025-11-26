#!/usr/bin/env python3
"""解析 drill cards 並標記能力標籤"""

import json
import re

# 能力標籤規則
ABILITY_RULES = {
    '平衡與姿態': ['平衡', '居中', '站姿', '姿態', '穩定'],
    '邊刃控制': ['刃', '立刃', '換刃', '刻滑', '邊刃'],
    '重心轉移': ['重心', '板頭', '板尾', '前腳', '後腳'],
    '關節運用': ['腳踝', '膝蓋', '髖', '折疊', '關節'],
    '旋轉技巧': ['旋轉', '視線', '反腳', '360', '180'],
    '地形適應': ['陡坡', '蘑菇', '粉雪', '冰', '地形']
}

def extract_abilities(text):
    """從文字中提取能力標籤"""
    abilities = []
    text_lower = text.lower()
    for ability, keywords in ABILITY_RULES.items():
        if any(kw in text_lower for kw in keywords):
            abilities.append(ability)
    return abilities

def parse_drills(filepath):
    """解析 drill cards"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    table_lines = [l for l in lines if l.strip().startswith('|') and '---' not in l]
    
    drills = []
    for line in table_lines[1:]:  # 跳過表頭
        cells = [c.strip() for c in line.split('|')[1:-1]]
        if len(cells) < 11:
            continue
            
        # 清理格式標記
        drill_id = cells[0].replace('**', '').strip()
        name = cells[1].replace('**', '').strip()
        
        # 提取能力標籤
        search_text = f"{name} {cells[2]}"  # 名稱 + 目的
        abilities = extract_abilities(search_text)
        
        drill = {
            'id': drill_id,
            'name': name,
            'purpose': cells[2],
            'steps': cells[3],
            'cues': cells[4].replace('<br>', '\n'),
            'errors': cells[5],
            'terrain': cells[6],
            'difficulty': cells[7],
            'metrics': cells[8],
            'time': cells[9],
            'safety': cells[10],
            'source': cells[11] if len(cells) > 11 else '',
            'abilities': abilities
        }
        drills.append(drill)
    
    return drills

if __name__ == '__main__':
    drills = parse_drills('snowboard_course/03_drill_cards.md')
    
    # 建立能力索引
    abilities_index = {}
    for drill in drills:
        for ability in drill['abilities']:
            if ability not in abilities_index:
                abilities_index[ability] = []
            abilities_index[ability].append(drill['id'])
    
    # 儲存
    output = {
        'drills': drills,
        'abilities_index': abilities_index
    }
    
    with open('data/drills.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 成功解析 {len(drills)} 個練習")
    print(f"✅ 能力分類: {list(abilities_index.keys())}")
    for ability, drill_ids in abilities_index.items():
        print(f"   - {ability}: {len(drill_ids)} 個練習")
