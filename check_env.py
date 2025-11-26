#!/usr/bin/env python3
"""檢查環境變數設定"""
import os
from dotenv import load_dotenv
load_dotenv()

print("=== 環境變數檢查 ===\n")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

print(f"SUPABASE_URL: {'✅ 已設定' if url else '❌ 未設定'}")
if url:
    print(f"  值: {url[:30]}...")

print(f"\nSUPABASE_KEY: {'✅ 已設定' if key else '❌ 未設定'}")
if key:
    print(f"  長度: {len(key)} 字元")
    print(f"  開頭: {key[:20]}...")
    print(f"  結尾: ...{key[-20:]}")

print("\n=== Supabase Client 測試 ===\n")

try:
    from supabase import create_client
    if url and key:
        client = create_client(url, key)
        print("✅ Client 建立成功")
        
        # 測試簡單查詢
        try:
            result = client.table("lessons").select("id").limit(1).execute()
            print(f"✅ 資料庫連線成功（找到 {len(result.data)} 筆資料）")
        except Exception as e:
            print(f"❌ 資料庫查詢失敗: {e}")
    else:
        print("❌ 環境變數未設定，無法建立 client")
except Exception as e:
    print(f"❌ Client 建立失敗: {e}")
