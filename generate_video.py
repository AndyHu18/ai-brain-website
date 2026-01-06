"""
AI 智能大腦公司 - Veo 3.1 影片生成腳本（含原生音效）
根據官方文檔: Prompt 中包含聲音描述即可同步生成音訊
"""

import time
import os
from google import genai
from google.genai import types

# API Key
API_KEY = "AIzaSyApMiwmJpbo0vX58K_n4sfCN6bqBDDd4Tk"

# 初始化客戶端
client = genai.Client(api_key=API_KEY)

def generate_hero_video_with_audio():
    """生成 Hero Section 的公司形象影片（含音效）"""
    
    print("=" * 60)
    print("AI 智能大腦公司 - Veo 3.1 影片生成（含原生音效）")
    print("=" * 60)
    
    # 影片 Prompt - 包含視覺與聲音描述
    # 關鍵：聲音描述放在 Prompt 中，Veo 會自動同步生成
    prompt = """
    A cinematic abstract visualization of artificial intelligence.
    
    VISUAL:
    Golden glowing neural network connections forming a brain shape, 
    floating in a deep warm brown-black space. Luxurious gold and 
    bronze colored data streams flow elegantly through the network. 
    Holographic interface elements with warm amber glow orbit slowly 
    around the central brain structure. Camera slowly orbits with 
    subtle zoom. Volumetric golden lighting creates depth. 
    Premium corporate technology aesthetic. 8K cinematic quality.
    
    AUDIO:
    Soft ambient electronic soundtrack with warm synthesizer pads.
    Gentle pulsing bass tones synchronized with the neural network 
    activity. Subtle futuristic whoosh sounds as data streams flow.
    Ethereal, premium corporate atmosphere. Calm and inspiring mood.
    No dialogue. Clean professional audio mix.
    """
    
    try:
        print("[1/4] 發送請求至 Veo 3.1 API（含音效生成）...")
        
        operation = client.models.generate_videos(
            model="veo-3.1-generate-preview",
            prompt=prompt,
            config=types.GenerateVideosConfig(
                number_of_videos=1,
                aspect_ratio="16:9",
            ),
        )
        
        print("[2/4] 等待影片與音效生成中...")
        print("      (這可能需要 2-5 分鐘，請耐心等待)")
        
        # 輪詢等待影片生成完成
        poll_count = 0
        while not operation.done:
            poll_count += 1
            print(f"      輪詢 #{poll_count}...", end="\r")
            time.sleep(10)
            operation = client.operations.get(operation)
        
        print("\n[3/4] 影片與音效生成完成！正在下載...")
        
        # 下載並儲存影片
        generated_video = operation.response.generated_videos[0]
        
        # 確保目錄存在
        os.makedirs("assets/videos", exist_ok=True)
        
        # 備份舊影片
        old_path = "assets/videos/hero-video.mp4"
        if os.path.exists(old_path):
            backup_path = "assets/videos/hero-video-no-audio.mp4"
            os.rename(old_path, backup_path)
            print(f"      舊影片已備份至: {backup_path}")
        
        output_path = "assets/videos/hero-video.mp4"
        
        # 使用官方建議的下載方式
        client.files.download(file=generated_video.video)
        generated_video.video.save(output_path)
        
        print(f"[4/4] 影片已儲存至: {output_path}")
        print("=" * 60)
        print("SUCCESS! 帶音效的影片生成完成！")
        print("=" * 60)
        
        return output_path
            
    except Exception as e:
        print(f"\n[ERROR] 發生錯誤: {e}")
        import traceback
        traceback.print_exc()
        return None


if __name__ == "__main__":
    result = generate_hero_video_with_audio()
    
    if result:
        print(f"\n影片路徑: {result}")
        print("請重新整理網站並開啟聲音查看效果！")
    else:
        print("\n影片生成失敗")
