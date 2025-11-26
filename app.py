#!/usr/bin/env python3
"""單板教學 App - 手機優先 UI"""
import streamlit as st
from dotenv import load_dotenv
load_dotenv()

from supabase_client import fetch_lessons, get_lesson_by_id, add_favorite, remove_favorite, get_favorites
from app_logic import filter_lessons, get_all_tags
from auth import login, signup, logout, get_current_user

# 標籤中文映射
LEVEL_NAMES = {"beginner": "初級", "intermediate": "中級", "advanced": "進階"}
SLOPE_NAMES = {"green": "綠道", "blue": "藍道", "black": "黑道", "mogul": "蘑菇", 
               "powder": "粉雪", "park": "公園", "tree": "樹林", "flat": "平地", "all": "全地形"}


def init_session():
    """初始化 session state"""
    if "user" not in st.session_state:
        st.session_state.user = None
    if "show_login" not in st.session_state:
        st.session_state.show_login = False
    if "favorites" not in st.session_state:
        st.session_state.favorites = []


def render_login_form():
    """登入/註冊表單"""
    st.markdown("### 🔐 登入 / 註冊")
    
    mode = st.radio("", ["登入", "註冊"], horizontal=True, key="auth_mode")
    
    email = st.text_input("📧 Email", key=f"{mode}_email")
    password = st.text_input("🔑 密碼", type="password", key=f"{mode}_pwd")
    
    if mode == "登入":
        if st.button("登入", use_container_width=True, type="primary"):
            if email and password:
                result = login(email, password)
                if "error" in result:
                    st.error(f"❌ {result['error']}")
                else:
                    st.session_state.user = result.get("user")
                    st.session_state.show_login = False
                    st.success("✅ 登入成功！")
                    st.rerun()
            else:
                st.warning("⚠️ 請輸入 Email 和密碼")
    else:
        if st.button("註冊", use_container_width=True, type="primary"):
            if email and password:
                result = signup(email, password)
                if "error" in result:
                    st.error(f"❌ {result['error']}")
                else:
                    st.success("✅ 註冊成功！請切換到「登入」")
            else:
                st.warning("⚠️ 請輸入 Email 和密碼")


def render_user_info():
    """顯示用戶資訊"""
    user = st.session_state.user
    if user:
        col1, col2 = st.columns([3, 1])
        with col1:
            st.caption(f"👤 {user.email if hasattr(user, 'email') else user.get('email', '')}")
        with col2:
            if st.button("登出", key="logout_btn"):
                logout()
                st.session_state.user = None
                st.rerun()


def main():
    st.set_page_config(page_title="單板教學", page_icon="🏂", layout="centered")
    init_session()
    
    # 手機優先樣式
    st.markdown("""
    <style>
    /* 全局 */
    .block-container { padding: 1rem 0.5rem; max-width: 100%; background: #0f172a; }
    .stApp { background: #0f172a; }
    
    /* 卡片 */
    .lesson-card {
        background: #1e293b;
        border-radius: 12px;
        padding: 1.2rem;
        margin-bottom: 1rem;
        border-left: 5px solid #fbbf24;
        cursor: pointer;
    }
    .card-problem { 
        color: #fbbf24; 
        font-size: 1.1rem; 
        font-weight: 600;
        margin-bottom: 0.8rem;
        line-height: 1.4;
    }
    .card-title { 
        color: #f1f5f9; 
        font-size: 1rem; 
        margin-bottom: 0.8rem;
    }
    
    /* 標籤 */
    .tag { 
        display: inline-block; 
        padding: 4px 12px; 
        border-radius: 16px; 
        font-size: 0.85rem; 
        margin-right: 6px;
        margin-bottom: 4px;
        font-weight: 500;
    }
    .tag-level { background: #22c55e; color: #0f172a; }
    .tag-slope { background: #3b82f6; color: white; }
    .tag-skill { background: #a855f7; color: white; }
    
    /* 詳情頁區塊 */
    .detail-section {
        background: #1e293b;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
    }
    .section-title {
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 0.8rem;
    }
    .signal-correct { color: #22c55e; font-size: 1rem; }
    .signal-wrong { color: #ef4444; font-size: 1rem; }
    
    /* 按鈕 */
    .stButton button {
        font-size: 1rem;
        padding: 0.6rem 1rem;
        font-weight: 500;
    }
    </style>
    """, unsafe_allow_html=True)
    
    # 載入資料
    lessons = fetch_lessons()
    
    # 載入用戶收藏
    if st.session_state.user and not st.session_state.favorites:
        user_id = st.session_state.user.get("id")
        st.session_state.favorites = get_favorites(user_id)
    all_levels, all_slopes, all_skills = get_all_tags(lessons)
    
    # 檢查是否在詳情頁
    if "selected_id" in st.query_params:
        render_detail(lessons, st.query_params["selected_id"])
        return
    
    # === 首頁 ===
    col_title, col_user = st.columns([3, 1])
    with col_title:
        st.title("🏂 單板教學")
    with col_user:
        if st.session_state.user:
            if st.button("👤", key="user_menu"):
                st.session_state.show_login = not st.session_state.show_login
        else:
            if st.button("登入", key="login_toggle"):
                st.session_state.show_login = not st.session_state.show_login
    
    # 登入表單
    if st.session_state.show_login:
        if st.session_state.user:
            render_user_info()
        else:
            render_login_form()
        st.divider()
    
    # 搜尋
    search = st.text_input("🔍", placeholder="搜尋問題或關鍵字...", label_visibility="collapsed")
    
    # 篩選器
    with st.expander("▼ 篩選", expanded=False):
        col1, col2 = st.columns(2)
        with col1:
            level = st.selectbox("程度", ["全部"] + [LEVEL_NAMES.get(l, l) for l in all_levels], key="level")
            level_val = next((k for k, v in LEVEL_NAMES.items() if v == level), None) if level != "全部" else None
        with col2:
            slope = st.selectbox("雪道", ["全部"] + [SLOPE_NAMES.get(s, s) for s in all_slopes], key="slope")
            slope_val = next((k for k, v in SLOPE_NAMES.items() if v == slope), None) if slope != "全部" else None
        
        skill = st.selectbox("CASI 技能", ["全部"] + all_skills, key="skill")
        skill_val = skill if skill != "全部" else None
        
        if st.button("🔄 清除篩選"):
            st.query_params.clear()
            st.rerun()
    
    # 篩選結果
    filtered = filter_lessons(lessons, level_val, slope_val, skill_val, search)
    st.caption(f"找到 {len(filtered)} 個練習")
    
    # 卡片列表
    for lesson in filtered:
        render_card(lesson)


def render_card(lesson: dict):
    """渲染課程卡片 - 問題優先"""
    level_tags = " ".join([f"<span class='tag tag-level'>{LEVEL_NAMES.get(t, t)}</span>" for t in lesson.get("level_tags", [])])
    slope_tags = " ".join([f"<span class='tag tag-slope'>{SLOPE_NAMES.get(t, t)}</span>" for t in lesson.get("slope_tags", [])])
    skill = lesson.get("casi", {}).get("Primary_Skill", "")
    skill_tag = f"<span class='tag tag-skill'>{skill}</span>" if skill else ""
    
    what = lesson.get("what", "")
    what_display = what[:80] + ("..." if len(what) > 80 else "")
    
    st.markdown(f"""
    <div class="lesson-card">
        <div class="card-problem">🎯 {what_display}</div>
        <div class="card-title">{lesson.get('title', '')}</div>
        <div>{level_tags} {slope_tags} {skill_tag}</div>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2 = st.columns([3, 1])
    with col1:
        if st.button(f"查看詳情", key=f"btn_{lesson['id']}", use_container_width=True):
            st.query_params["selected_id"] = lesson["id"]
            st.rerun()
    with col2:
        if st.session_state.user:
            is_fav = lesson["id"] in st.session_state.favorites
            if st.button("❤️" if is_fav else "🤍", key=f"fav_{lesson['id']}", use_container_width=True):
                user_id = st.session_state.user.get("id")
                if is_fav:
                    remove_favorite(user_id, lesson["id"])
                    st.session_state.favorites.remove(lesson["id"])
                else:
                    add_favorite(user_id, lesson["id"])
                    st.session_state.favorites.append(lesson["id"])
                st.rerun()


def render_detail(lessons: list, lesson_id: str):
    """渲染詳情頁"""
    lesson = get_lesson_by_id(lesson_id) or next((l for l in lessons if l["id"] == lesson_id), None)
    if not lesson:
        st.error("找不到此練習")
        return
    
    col1, col2 = st.columns([3, 1])
    with col1:
        if st.button("← 返回列表"):
            st.query_params.clear()
            st.rerun()
    with col2:
        if st.session_state.user:
            is_fav = lesson["id"] in st.session_state.favorites
            if st.button("❤️ 已收藏" if is_fav else "🤍 收藏", use_container_width=True):
                user_id = st.session_state.user.get("id")
                if is_fav:
                    remove_favorite(user_id, lesson["id"])
                    st.session_state.favorites.remove(lesson["id"])
                else:
                    add_favorite(user_id, lesson["id"])
                    st.session_state.favorites.append(lesson["id"])
                st.rerun()
    
    # 標題和標籤
    st.title(lesson.get("title", ""))
    
    level_tags = " ".join([f"<span class='tag tag-level'>{LEVEL_NAMES.get(t, t)}</span>" for t in lesson.get("level_tags", [])])
    slope_tags = " ".join([f"<span class='tag tag-slope'>{SLOPE_NAMES.get(t, t)}</span>" for t in lesson.get("slope_tags", [])])
    skill = lesson.get("casi", {}).get("Primary_Skill", "")
    skill_tag = f"<span class='tag tag-skill'>{skill}</span>" if skill else ""
    st.markdown(f"{level_tags} {slope_tags} {skill_tag}", unsafe_allow_html=True)
    
    st.divider()
    
    # 問題
    st.markdown(f"""
    <div class="detail-section">
        <div class="section-title">😰 問題</div>
        <div style="font-size: 1.05rem; line-height: 1.6;">{lesson.get("what", "")}</div>
    </div>
    """, unsafe_allow_html=True)
    
    # 目標
    why_items = "".join([f"<div style='margin-bottom: 0.5rem;'>• {item}</div>" for item in lesson.get("why", [])])
    st.markdown(f"""
    <div class="detail-section">
        <div class="section-title">🎯 目標</div>
        <div style="font-size: 1rem; line-height: 1.6;">{why_items}</div>
    </div>
    """, unsafe_allow_html=True)
    
    # 怎麼練
    st.markdown('<div class="detail-section"><div class="section-title">🛠️ 怎麼練</div>', unsafe_allow_html=True)
    for i, step in enumerate(lesson.get("how", []), 1):
        text = step.get("text", "") if isinstance(step, dict) else step
        if text.strip():
            st.markdown(f"**{i}.** {text}")
        img = step.get("image") if isinstance(step, dict) else None
        if img:
            st.image(img)
    st.markdown('</div>', unsafe_allow_html=True)
    
    # 做對/做錯訊號
    signals = lesson.get("signals", {})
    if signals.get("correct") or signals.get("wrong"):
        col1, col2 = st.columns(2)
        with col1:
            if signals.get("correct"):
                correct_items = "".join([f"<div class='signal-correct' style='margin-bottom: 0.5rem;'>• {s}</div>" for s in signals["correct"]])
                st.markdown(f"""
                <div class="detail-section">
                    <div class="section-title">✅ 做對訊號</div>
                    {correct_items}
                </div>
                """, unsafe_allow_html=True)
        with col2:
            if signals.get("wrong"):
                wrong_items = "".join([f"<div class='signal-wrong' style='margin-bottom: 0.5rem;'>• {s}</div>" for s in signals["wrong"]])
                st.markdown(f"""
                <div class="detail-section">
                    <div class="section-title">❌ 做錯訊號</div>
                    {wrong_items}
                </div>
                """, unsafe_allow_html=True)
    
    # CASI 分類
    casi = lesson.get("casi", {})
    if casi.get("Primary_Skill") or casi.get("Core_Competency"):
        casi_content = ""
        if casi.get("Primary_Skill"):
            casi_content += f"<div style='margin-bottom: 0.5rem;'>主要技能：{casi['Primary_Skill']}</div>"
        if casi.get("Core_Competency"):
            casi_content += f"<div>核心能力：{casi['Core_Competency']}</div>"
        st.markdown(f"""
        <div class="detail-section">
            <div class="section-title">📚 CASI 分類</div>
            {casi_content}
        </div>
        """, unsafe_allow_html=True)


if __name__ == "__main__":
    main()
