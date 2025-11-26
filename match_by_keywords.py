#!/usr/bin/env python3
import os, re, json

SAM_DIR = "/Users/jameschen/Downloads/單板教學/sam"
CLEANED_DIR = "/Users/jameschen/Downloads/單板教學/sam_cleaned"
MAPPING_FILE = "/Users/jameschen/Downloads/單板教學/file_mapping.json"

with open(MAPPING_FILE, 'r') as f:
    existing = json.load(f)

# 手動規則：根據標題關鍵字
rules = [
    ("腳踝感知", "试试这个，帮你感受你有脚踝.txt"),
    ("直跳收腿", "公园第一集｜直飞： 收腿的时机决定你稳不稳.txt"),
    ("蹦床反擰", "公园第三集：蹦床如何增加旋转.txt"),
    ("抓板要彎腰", '公园第二集｜抓板： 收腿得配合"弯腰".txt'),
    ("前換後腳踝關閉", "前换后：保持脚踝关闭.txt"),
    ("膝頂板頭", "前换后：膝盖带动脚踝去控制立刃.txt"),
    ("前換後不後躺", '前刃换后刃基础：如何不后"躺".txt'),
    ("膝蓋轉動", '试试让你的膝盖这么"转".txt'),
    ("髖打開快換刃", "尝试让你的髋保持打开，小回转就小了.txt"),
    ("換刃先髖回中", '换刃时前手别"烙饼"🥞.txt'),
    ("前腳蓄力傳導", "进阶：前脚的蓄力与传导.txt"),
    ("視線看山下", "进阶：视线别再看两侧了.txt"),
    ("後刃挺背", "看看你的后刃是否：驼背.txt"),
    ("有蹲無起", '看看你的滑行里是否有"蹲"无"起".txt'),
    ("團身是工具", "浅聊团身.txt"),
    ("平地臀跳", '能在平地练习的"豚跳".txt'),
    ("摔飛案例", "摔飞.txt"),
    ("五種板型", "如果让我选5种板型.txt"),
    ("水泥粉", "15水泥粉里不摔跤小技巧.txt"),
    ("密林反擰", "树林里比较密：上下半身反拧.txt"),
    ("側壁貼底", "基础滑蘑菇小练习：板底走侧墙.txt"),
    ("蘑菇視線", "蘑菇路线选择小Tip.txt"),
    ("過包頂追身", "蘑菇第二集：过包顶之后"追身".txt"),
    ("上包先換重心", "蘑菇里先换重心？还是先换刃.txt"),
    ("蘑菇後換前壓板底", "蘑菇里：后刃换前刃.txt"),
    ("粉雪順序", "粉雪里的顺序：换重心施压立刃轴转.txt"),
    ("後刃帶轉角度", "带转角度第一集：后刃逻辑.txt"),
    ("前刃小角度帶轉", '带转角度："消失"的前刃.txt'),
    ("反向軸轉", '通过"轴转"帮你陡坡和蘑菇控速.txt'),
    ("肩膀起伏", '通过"肩膀"的起伏帮助你增加滑行稳定性.txt'),
    ("道內下帶上", '道内应该"下带上".txt'),
    ("橫切通過", "陡坡换刃第六集： 89度坡横切换刃.txt"),
    ("上帶下時機", "陡坡换刃第四集： 上带下.txt"),
    ("黑道跳換", "陡坡黑道基础换刃第一集：跳换（黑钻）.txt"),
    ("陡坡齊平", "陡坡换刃第三集：双腿承重Alignment.txt"),
    ("陡坡先壓再轉", '陡坡换刃停止下"坠".txt'),
    ("冰包點觸", '25冰蘑菇：处理"冰棱".txt'),
    ("彎末延後給壓", "弯末压力释放（late pressure release）.txt"),
    ("彎中板頭板尾", "弯里的板头板尾移动.txt"),
    ("後刃蓄力轉完", "看看你的后刃是否：转完.txt"),
    ("後刃摸鞋", "蓝黑道烂雪后刃防抖练习.txt"),
    ("爛雪推不切", "暴雪过后： 烂雪去推，别切.txt"),
    ("進階牛仔站姿", "进阶版牛仔站姿：帮助你更居中稳定.txt"),
    ("上半弧四重點", "深聊上半弧.txt"),
    ("蘑菇轉彎選上半包", "滑蘑菇的一个底层逻辑.txt"),
    ("下蹲量握手力", '滑雪"下蹲"这个量如何把控.txt'),
    ("前換後防卡", "解决前换后卡刃小练习.txt"),
    ("換刃卡頓", '解决换刃"卡顿".txt'),
    ("前腿壓力破後座", "重心后座？用这个绝招解决.txt"),
    ("前重過猛後腿", "重心在前脚过多？试试这个.txt"),
    ("感受腳外側", "13 又一个改重心压前脚的小技巧.txt"),
    ("後腳送轉別掰", '基础：转弯别"掰"弯.txt'),
    ("先彎前腿防軸轉", "16以前腿为轴转弯：得改.txt"),
    ("粘雪抬頭搖板", "粘雪里前脚酸痛怎么办.txt"),
    ("CASI3評分", "谈谈CASI三级滑行.txt"),
    ("Apex跳戒肩轉", "21一个练习：改你肩带转.txt"),
    ("膝隨髖轉牛仔", "浅聊：你其实转的不是你的膝盖，而是….txt"),
    ("別用膝扭轉用髖", '转弯时候的"转"先转还是后转？.txt'),
    ("進階路線與流程", "第一出道外：试试练习这三个阶段.txt"),
]

new_mapping = {}
used_sam = set(existing.values())

all_cleaned = [f for f in os.listdir(CLEANED_DIR) if re.match(r'^\d+_.*\.md$', f)]

for cleaned_file in all_cleaned:
    if cleaned_file in existing:
        continue
    
    title = re.match(r'^\d+_(.+?)__', cleaned_file).group(1)
    
    for keyword, sam_file in rules:
        if keyword in title and sam_file not in used_sam and sam_file not in new_mapping.values():
            new_mapping[cleaned_file] = sam_file
            used_sam.add(sam_file)
            print(f"✅ {title[:25]}... → {sam_file[:45]}...")
            break

final = {**existing, **new_mapping}
with open(MAPPING_FILE, 'w', encoding='utf-8') as f:
    json.dump(final, f, ensure_ascii=False, indent=2)

print(f"\n新增: {len(new_mapping)}, 總計: {len(final)}/{len(all_cleaned)}")
