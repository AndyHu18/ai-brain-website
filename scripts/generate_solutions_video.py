"""
AI 智能大腦公司 - 四大 AI 解決方案影片生成腳本
使用 Veo 3.1 生成，含背景音樂

四大主題：
1. 智能語音服務 - AI 接聽每一通來電
2. 智能數據分析 - 讓 AI 讀懂複雜報表
3. 流程自動化 - 重複工作交給機器
4. 內容智能生成 - AI 驅動的內容產線
"""

import time
import os
import sys
from pathlib import Path

# UTF-8 編碼設定 (Windows 相容)
if sys.stdout is not None:
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

from google import genai
from google.genai import types

# API Key (主要)
API_KEY = "AIzaSyDSqc62QRFNF2X0Xb2ZUg2CFjc1g-hEi4Y"
# 備用 API Key
BACKUP_API_KEY = "AIzaSyBTEjyrvCQ6ZgSELcb81pxGQMCfYlu1Jy8"
BACKUP_API_KEY_2 = "AIzaSyDXJ8_LEsUVDKdX2y3VrvA2YhI2MVN30V44"

# 輸出設定
OUTPUT_DIR = Path("../assets/videos")
OUTPUT_FILENAME = "ai-solutions-showcase.mp4"

# 模型選擇
MODEL = "veo-3.1-fast-generate-preview"  # 快速模式，節省配額

# 影片 Prompt - 四大解決方案視覺融合
SOLUTIONS_PROMPT = """
VISUAL:
A premium cinematic visualization showcasing four pillars of AI enterprise solutions.

Scene 1 (0-2s): Golden holographic phone interface floating in warm amber space, 
sound waves rippling outward representing intelligent voice assistant technology. 
Taiwanese professional office aesthetic.

Scene 2 (2-4s): Transform into glowing data charts and financial reports, 
neural networks analyzing spreadsheets with bronze data streams flowing elegantly. 
Holographic pie charts and trend lines pulse with warm golden light.

Scene 3 (4-6s): Morph into interconnected workflow automation gears and circuits, 
robotic process flows with warm amber energy connecting multiple enterprise systems. 
Cross-platform synchronization visualization.

Scene 4 (6-8s): Evolve into content creation interface, AI-generated documents, 
videos, and social media assets orbiting a central creative hub with golden glow.
Premium visual quality, modern corporate technology aesthetic.

Camera: Smooth orbital movement, subtle zoom transitions.
Lighting: Warm amber volumetric lighting, golden hour glow.
Style: 8K cinematic quality, no text, no subtitles, no watermarks.

AUDIO:
Soft ambient electronic soundtrack with warm synthesizer pads and gentle piano notes.
Uplifting corporate mood, inspiring and professional atmosphere.
Subtle futuristic transition sounds between scenes.
Pulsing bass synchronized with visual transformations.
Clean professional audio mix, no dialogue, calm and premium feel.
"""


def generate_solutions_video():
    """生成四大 AI 解決方案展示影片"""
    
    print("=" * 70)
    print("AI 智能大腦公司 - 四大 AI 解決方案影片生成")
    print("=" * 70)
    print("\n主題：智能語音服務 | 智能數據分析 | 流程自動化 | 內容智能生成\n")
    
    # 確保輸出目錄存在
    output_path = OUTPUT_DIR / OUTPUT_FILENAME
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # 初始化客戶端
    client = genai.Client(api_key=API_KEY)
    
    try:
        print("[1/4] 發送請求至 Veo 3.1 API...")
        print(f"      模型：{MODEL}")
        print(f"      輸出：{output_path}")
        
        # 注意：Gemini API 的 Veo 3.1 不需要額外的 generateAudio 參數
        # 音頻會透過 Prompt 中的 [AUDIO] 描述自動生成
        operation = client.models.generate_videos(
            model=MODEL,
            prompt=SOLUTIONS_PROMPT.strip(),
            config=types.GenerateVideosConfig(
                numberOfVideos=1,
                aspectRatio="16:9",
                duration_seconds=8,
            ),
        )
        
        print(f"\n[2/4] 任務已提交！")
        print(f"      任務 ID: {operation.name}")
        print(f"      等待影片與音效生成中... (約 1-3 分鐘)")
        
        # 輪詢等待
        poll_count = 0
        max_polls = 30  # 最多等待 5 分鐘
        
        while not operation.done and poll_count < max_polls:
            poll_count += 1
            minutes = (poll_count * 10) // 60
            seconds = (poll_count * 10) % 60
            print(f"      輪詢 #{poll_count}... 已等待 {minutes}m {seconds}s", end="\r")
            time.sleep(10)
            operation = client.operations.get(operation)
        
        print()  # 換行
        
        if not operation.done:
            print("\n[ERROR] 生成超時！請稍後重試。")
            return None
        
        print("\n[3/4] 影片生成完成！正在下載...")
        
        # 獲取生成結果
        result = operation.result
        if result and result.generated_videos:
            video_obj = result.generated_videos[0].video
            
            # 下載並儲存
            client.files.download(file=video_obj)
            video_obj.save(str(output_path))
            
            print(f"\n[4/4] 影片已儲存！")
            print("=" * 70)
            print(f"SUCCESS! 四大 AI 解決方案影片生成完成！")
            print(f"路徑：{output_path.absolute()}")
            print("=" * 70)
            
            return str(output_path)
        else:
            print("\n[ERROR] 無法獲取生成的影片")
            return None
            
    except Exception as e:
        error_msg = str(e)
        print(f"\n[ERROR] 發生錯誤: {error_msg}")
        
        # 如果是配額問題，提示使用備用 Key
        if "429" in error_msg or "exhausted" in error_msg.lower():
            print("\n配額已用盡！建議使用備用 API Key：")
            print(f"  備用 1: {BACKUP_API_KEY}")
            print(f"  備用 2: {BACKUP_API_KEY_2}")
        
        import traceback
        traceback.print_exc()
        return None


if __name__ == "__main__":
    result = generate_solutions_video()
    
    if result:
        print(f"\n影片路徑: {result}")
        print("請將此影片整合至網站的「四大 AI 解決方案」區塊！")
    else:
        print("\n影片生成失敗，請檢查 API 配額或網路連線。")
