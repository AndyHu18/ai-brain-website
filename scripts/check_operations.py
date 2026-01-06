"""
Test script to check Veo 3.1 operation status and download videos
"""
from google import genai
from google.genai import types
import time
from pathlib import Path

API_KEY = 'AIzaSyApMiwmJpbo0vX58K_n4sfCN6bqBDDd4Tk'
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "videos" / "services"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

client = genai.Client(api_key=API_KEY)

# 已提交的操作
OPERATIONS = {
    "01_content_editor": "hhmsss0to5u5",
    "02_voice_receptionist": "kyrko71qul4c", 
    "03_brand_clone": "5ufl2chwrqoi",
}

FILENAMES = {
    "01_content_editor": "service_content_editor.mp4",
    "02_voice_receptionist": "service_voice_receptionist.mp4",
    "03_brand_clone": "service_brand_clone.mp4",
}

print("="*60)
print("Checking Veo 3.1 Operation Status")
print("="*60)

for name, op_id in OPERATIONS.items():
    full_op_name = f"models/veo-3.1-fast-generate-preview/operations/{op_id}"
    print(f"\n[{name}]")
    print(f"  Operation: {op_id}")
    
    try:
        # 嘗試不同的方法獲取操作狀態
        # 方法 1: 使用 operations.get
        try:
            op = client.operations.get(operation=full_op_name)
            print(f"  Status (via operations.get): done={op.done}")
        except Exception as e1:
            print(f"  Method 1 failed: {e1}")
            
            # 方法 2: 列出操作
            try:
                ops = client.operations.list()
                found = False
                for o in ops:
                    if op_id in str(o):
                        print(f"  Found in list: {o}")
                        found = True
                        break
                if not found:
                    print(f"  Not found in operations list")
            except Exception as e2:
                print(f"  Method 2 failed: {e2}")
                
    except Exception as e:
        print(f"  Error: {type(e).__name__}: {e}")

print("\n" + "="*60)
print("Check complete")
print("="*60)
