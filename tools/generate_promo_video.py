#!/usr/bin/env python3
"""
📹 AI 智能大腦 - 六大服務宣傳影片生成器
使用 Google Veo 3.1 API 生成具備音樂和音效的專業影片

用途：取代首頁「我們能為您做什麼」區塊的影片
目標：展示六大服務場景，主角為台灣年輕專業人士（25-35歲）
"""

import time
import os
from google import genai

# === 📍 配置 ===
API_KEY = "AIzaSyAL0_cJPEpN9hWBNDfFcgfbrkjvbWI01ks"  # 備用 API Key
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "assets", "videos")

# === 🎬 影片提示詞設計 ===
# 符合 Veo 3.1 最佳實踐：
# 1. 主題明確（台灣年輕專業人士）
# 2. 動作描述（每個場景的互動）
# 3. 攝影風格（現代商業風格）
# 4. 對話和音效提示（使用引號）
# 5. 氛圍設定（專業、溫暖、高科技感）

PROMO_VIDEO_PROMPT = """
ULTRA FAST-PACED cinematic commercial showcasing business success in Taiwan.
NO SCREENS, NO COMPUTERS, NO PHONES, NO TABLETS, NO TEXT, NO ROBOTS.
RAPID 1-second cuts between scenes. Modern corporate aesthetic.
MUST ONLY SHOW TAIWANESE PEOPLE (EAST ASIAN FEATURES, BLACK HAIR, AGES 25-40).
ALL SCENES IN OFFICE ENVIRONMENTS ONLY.
MUSIC ONLY - NO DIALOGUE, NO SPEECH, NO VOICE, NO CHINESE, NO ENGLISH WORDS.

Scene 1 - Office Reception (1 sec):
Modern office lobby, marble desk, young Taiwanese receptionist greeting visitor.
Wide shot, golden morning light, elegant interior.

Scene 2 - Open Office Space (1 sec):
Panoramic view of open-plan office with rows of desks.
Taiwanese professionals walking, dynamic energy, natural light.

Scene 3 - Conference Room (1 sec):
Glass-walled meeting room, 6 executives around oval table.
Bird's eye view, documents on table, Taipei skyline through windows.

Scene 4 - Brainstorming Session (1 sec):
Standing meeting at whiteboard, 4 young professionals discussing.
Colorful sticky notes, collaborative energy, casual smart attire.

Scene 5 - Private Office (1 sec):
Executive office with city view, young manager reviewing documents.
Modern furniture, warm lighting, professional atmosphere.

Scene 6 - Call Center (1 sec):
Modern workspace with headset operators, rows of desks.
Medium shot of smiling female agent, clean white environment.

Scene 7 - Training Room (1 sec):
Classroom with 15 professionals at desks, presenter at front.
Wide shot, engaged audience, professional development setting.

Scene 8 - Office Kitchen (1 sec):
Modern pantry area, three colleagues chatting over coffee.
Relaxed posture, authentic conversation, warm tungsten lighting.

Scene 9 - Hallway Walk (1 sec):
Two business partners walking through modern corridor.
Dynamic tracking shot, glass walls, sleek corporate interior.

Scene 10 - Team High-Five (1 sec):
Two young colleagues celebrating success with high-five.
Joyful moment, office background, natural expressions.

Scene 11 - Document Signing (1 sec):
Hands signing contract on desk, elegant pen.
Close-up of hands only, professional setting, warm wood desk.

Scene 12 - Co-working Space (1 sec):
Trendy shared workspace with bean bags and plants.
Young entrepreneurs collaborating, startup vibe.

Scene 13 - Client Meeting (1 sec):
Sales executive presenting to two clients in modern meeting room.
Professional handshake moment, warm business relationship.

Scene 14 - Elevator Lobby (1 sec):
Modern elevator area, executive stepping out.
Sleek interior, marble floors, business attire.

Scene 15 - Window View Meeting (1 sec):
Two executives talking by floor-to-ceiling windows.
Silhouettes against sunset sky, cityscape background.

Scene 16 - Team Huddle (1 sec):
Circle of hands stacked in center, team unity gesture.
Looking down at joined hands, mix of male and female.

Scene 17 - Award Trophy (1 sec):
Golden trophy on shelf in office, bokeh lights behind.
Close-up of shiny award, success symbolism.

Final Shot - Team Success (1.5 sec):
Group of 5 professionals walking confidently in glass lobby.
Orange sunset light streaming in, epic wide shot.
Inspiring orchestral crescendo, triumphant ending.

CRITICAL REQUIREMENTS:
- ONLY Taiwanese people (East Asian, black hair, ages 25-40)
- NO ROBOTS OR AI MACHINES IN ANY SCENE
- NO SERVER ROOMS OR TECHNICAL EQUIPMENT
- ALL scenes in office/corporate environments only
- ULTRA-FAST 1-second cuts (except final shot)
- 18 total scenes for maximum variety
- NO screens, monitors, phones, tablets, or displays
- NO text, signs, logos, subtitles, or written content
- NO extreme close-ups of faces (medium and wide shots)
- 16:9 aspect ratio
- Warm orange and white color grading
- MUSIC ONLY: Upbeat inspiring corporate electronic instrumental
- NO DIALOGUE, NO VOICE, NO SPEECH (Chinese or English)
- Sound design: Fast whoosh transitions, energetic tones ONLY
"""

def generate_single_video(client, version_num):
    """生成單一影片"""
    output_file = os.path.join(OUTPUT_PATH, f"ai-solutions-version-{version_num}.mp4")
    
    print(f"\n🎬 正在生成版本 {version_num}...")
    print("   ⏳ 這可能需要 2-5 分鐘，請耐心等待...\n")
    
    try:
        # 呼叫 Veo 3.1 API
        operation = client.models.generate_videos(
            model="veo-3.1-generate-preview",
            prompt=PROMO_VIDEO_PROMPT,
        )
        
        # 輪詢檢查生成狀態
        poll_count = 0
        while not operation.done:
            poll_count += 1
            print(f"   ⏳ 版本{version_num} [{poll_count * 10}s] 影片生成進行中...")
            time.sleep(10)
            operation = client.operations.get(operation)
        
        print(f"\n✅ 版本 {version_num} 生成完成！")
        
        # 下載生成的影片
        generated_video = operation.response.generated_videos[0]
        client.files.download(file=generated_video.video)
        generated_video.video.save(output_file)
        
        print(f"   📁 已儲存: {output_file}")
        return output_file
        
    except Exception as e:
        print(f"\n❌ 版本 {version_num} 發生錯誤: {e}")
        return None


def main():
    """生成三個版本的宣傳影片供用戶選擇"""
    print("=" * 60)
    print("📹 AI 智能大腦 - Veo 3.1 宣傳影片生成器")
    print("📦 將生成 3 個版本供您選擇")
    print("=" * 60)
    
    # 初始化客戶端
    print("\n🔑 正在初始化 Gemini 客戶端...")
    client = genai.Client(api_key=API_KEY)
    
    # 確保輸出目錄存在
    os.makedirs(OUTPUT_PATH, exist_ok=True)
    
    print(f"\n📝 影片提示詞長度: {len(PROMO_VIDEO_PROMPT)} 字元")
    
    # 生成五個版本
    successful_videos = []
    for version in range(1, 6):
        result = generate_single_video(client, version)
        if result:
            successful_videos.append(result)
    
    print("\n" + "=" * 60)
    print("🎉 影片生成完成！")
    print("=" * 60)
    print(f"\n✅ 成功生成 {len(successful_videos)} 個版本:")
    for video in successful_videos:
        print(f"   📁 {video}")
    
    print("\n📍 請瀏覽以下路徑選擇您喜歡的版本:")
    print(f"   📂 {OUTPUT_PATH}")
    print("\n💡 選定後，將檔案重命名為 ai-solutions-showcase.mp4")


if __name__ == "__main__":
    main()
