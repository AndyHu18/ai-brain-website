"""
Veo 3.1 Video Generation Script - Full 6 Service Videos
Working version after successful test
"""

import time
import sys
from pathlib import Path
from google import genai
from google.genai import types

# Force UTF-8 output
if sys.stdout is not None:
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

# ============================================================
# Configuration
# ============================================================
API_KEY = "AIzaSyDSqc62QRFNF2X0Xb2ZUg2CFjc1g-hEi4Y"  # Backup key (main key quota exceeded)
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "videos" / "services"
MODEL = "veo-3.1-fast-generate-preview"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================
# 6 Service Video Prompts
# ============================================================
SERVICE_PROMPTS = {
    "01_content_editor": {
        "filename": "service_content_editor.mp4",
        "prompt": """
A young Taiwanese professional woman in her late 20s sits at a modern minimalist desk 
in a bright, sunlit office with large windows. She looks at multiple monitors displaying 
social media analytics dashboards with colorful graphs. She smiles with satisfaction. 
Soft natural lighting, warm color temperature, shallow depth of field. 
Slow dolly push towards her face. Clean modern office with plants.
Cinematic, professional, warm tones, no text, no subtitles, no watermarks.
"""
    },
    
    "02_voice_receptionist": {
        "filename": "service_voice_receptionist.mp4",
        "prompt": """
Professional Taiwanese woman in her early 30s wearing a wireless headset, 
working at a modern customer service center. She speaks warmly with expressive hand gestures.
Background shows a busy but organized call center with soft bokeh lighting. 
Tracking shot slowly moving around her. Natural office lighting with subtle blue accents.
Documentary style, natural lighting, no text, no subtitles, no watermarks.
"""
    },
    
    "03_brand_clone": {
        "filename": "service_brand_clone.mp4",
        "prompt": """
Creative young Taiwanese content creator in a stylish co-working space with 
exposed brick walls. They sit at a trendy desk with laptop and ring light.
Computer screen shows social media platforms. Creative materials and coffee on desk.
Soft natural light mixed with warm artificial lighting. Slow pan across workspace.
Lifestyle aesthetic, warm and inviting, no text, no subtitles, no watermarks.
"""
    },
    
    "04_chatbot": {
        "filename": "service_chatbot.mp4",
        "prompt": """
Taiwanese e-commerce business owner in their mid-30s at a hybrid office-warehouse space.
They look at a computer screen showing customer chat interface with multiple conversations.
They smile with relief and satisfaction. Shipping boxes visible in background.
Warm overhead lighting. Camera slowly dollies in as they nod approvingly.
Business documentary style, authentic, warm lighting, no text, no subtitles, no watermarks.
"""
    },
    
    "05_meeting_notes": {
        "filename": "service_meeting_notes.mp4",
        "prompt": """
Modern glass-walled meeting room with stunning city skyline view through large windows.
Four Taiwanese business professionals in smart casual attire engaged in animated discussion.
One person presenting while others listen with tablets and notebooks.
Natural daylight, bright productive atmosphere. Slow tracking shot around the table.
Corporate documentary, natural lighting, no text, no subtitles, no watermarks.
"""
    },
    
    "06_consultant": {
        "filename": "service_consultant.mp4",
        "prompt": """
High-end executive office with a Taiwanese AI consultant in formal business attire
meeting with company CEO. Premium wooden conference table with large display showing
data visualizations. Both engaged in strategic discussion with confident body language.
Luxurious office with city views. Slow orbit shot. Golden hour lighting through windows.
Premium corporate, luxury aesthetic, cinematic lighting, no text, no subtitles, no watermarks.
"""
    }
}


def generate_video(client, service_key, prompt_data):
    """Generate a single service video"""
    filename = prompt_data["filename"]
    prompt = prompt_data["prompt"]
    output_path = OUTPUT_DIR / filename
    
    print(f"\n{'='*60}")
    print(f"[{service_key}] Starting...")
    print(f"   Output: {output_path}")
    print(f"{'='*60}")
    
    try:
        # Submit
        operation = client.models.generate_videos(
            model=MODEL,
            prompt=prompt.strip(),
            config=types.GenerateVideosConfig(
                numberOfVideos=1,
                aspectRatio="16:9",
            ),
        )
        
        print(f"   Task: {operation.name}")
        
        # Polling
        poll_count = 0
        max_polls = 30
        
        while not operation.done and poll_count < max_polls:
            poll_count += 1
            print(f"   Waiting... ({poll_count * 10}s)")
            time.sleep(10)
            operation = client.operations.get(operation)
        
        if not operation.done:
            raise TimeoutError(f"Timeout after {max_polls * 10}s")
        
        # Download
        result = operation.result
        if result and result.generated_videos:
            video = result.generated_videos[0]
            if video.video and video.video.uri:
                client.files.download(file=video.video)
                video.video.save(str(output_path))
                print(f"[SUCCESS] {service_key} -> {output_path}")
                return True, str(output_path)
        
        raise ValueError("No video in result")
        
    except Exception as e:
        error = f"{type(e).__name__}: {e}"
        print(f"[FAILED] {service_key}: {error}")
        return False, error


def main():
    print("\n" + "="*60)
    print("Veo 3.1 - Generating 6 Service Videos")
    print("="*60)
    print(f"Model: {MODEL}")
    print(f"Output: {OUTPUT_DIR}")
    print("="*60)
    
    client = genai.Client(api_key=API_KEY)
    
    results = {"success": [], "failed": []}
    
    for key, data in SERVICE_PROMPTS.items():
        success, result = generate_video(client, key, data)
        
        if success:
            results["success"].append((key, result))
        else:
            results["failed"].append((key, result))
        
        # Wait between requests
        time.sleep(5)
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Success: {len(results['success'])}")
    for k, v in results["success"]:
        print(f"   + {k}")
    
    if results["failed"]:
        print(f"\nFailed: {len(results['failed'])}")
        for k, v in results["failed"]:
            print(f"   - {k}: {v}")
    
    print("="*60 + "\n")
    return len(results["failed"]) == 0


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
