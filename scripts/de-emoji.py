#!/usr/bin/env python3
"""
De-Emoji 批次處理腳本 v2.0
============================
將服務頁面中的 Emoji 替換為專業標籤，符合 /visionnew 規範
- 移除所有原生 Emoji
- 使用文字標籤（JS 會自動替換為 SVG）
- 引入 icons.css 和 icons.js

作者: AI 智能大腦
日期: 2026-01-07
"""

import os
import re
from pathlib import Path

# 專案根目錄
PROJECT_ROOT = Path(__file__).parent.parent

# Emoji 到文字標籤的映射表
EMOJI_MAP = {
    # 聲音控制
    '🔇': 'OFF',
    '🔊': 'ON',
    
    # 服務圖標
    '📝': 'CONTENT',
    '📞': 'VOICE',
    '🎭': 'BRAND',
    '🤖': 'BOT',
    '📋': 'NOTES',
    '🧠': 'THINK',
    
    # 流程標籤
    '🎬': '',
    '💡': '',
    '💰': 'SAVE',
    '⏰': 'TIME',
    '📈': 'GROWTH',
    '📍': '',
    
    # 工作流程節點
    '🔍': '',
    '📊': '',
    '✍️': '',
    '📤': '',
    '📱': '',
    '📡': 'CONNECT',
    '🔥': 'HOT',
    '✅': 'OK',
    '📌': 'PIN',
    '🔎': 'SEARCH',
    '🔧': 'BUILD',
    '🔐': 'SECURE',
    '🖼️': 'IMAGE',
    '📲': 'SEND',
    '👀': 'VIEW',
    '🎉': 'SUCCESS',
    '🔌': 'LINK',
    '🎤': 'MIC',
    '🗣️': 'SPEAK',
    '💬': 'CHAT',
    '📆': 'SCHEDULE',
    '📧': 'EMAIL',
    '📁': 'FILE',
    '👤': 'USER',
    '📅': 'DATE',
    '💭': 'THINK',
    '🔄': 'SYNC',
    '🎨': 'DESIGN',
    '💚': 'DONE',
    '📖': 'READ',
    '📑': 'DOC',
    '🎙️': 'MIC',
    '📄': 'PAGE',
    '🏥': 'HEALTH',
    '⚙️': 'TECH',
    '⚡': 'FAST',
    '⚠️': 'WARN',
    '📚': 'LEARN',
    '🎓': 'CERT',
    '🔬': 'ANALYZE',
    '📐': 'PLAN',
    '👥': 'TEAM',
    '✨': 'NEW',
}

def process_html_file(filepath: Path) -> tuple[bool, int]:
    """
    處理單個 HTML 文件
    
    Returns:
        (is_modified, replacement_count)
    """
    try:
        content = filepath.read_text(encoding='utf-8')
    except Exception as e:
        print(f'  ❌ 讀取失敗: {e}')
        return False, 0
    
    original_content = content
    replacement_count = 0
    
    # 1. 確保引入 icons.css
    if 'icons.css' not in content:
        content = content.replace(
            '<link rel="stylesheet" href="../css/n8n-responsive.css">',
            '<link rel="stylesheet" href="../css/n8n-responsive.css">\n    <link rel="stylesheet" href="../css/icons.css">'
        )
        replacement_count += 1
        print('    + 已加入 icons.css')
    
    # 2. 確保引入 icons.js
    if 'icons.js' not in content:
        content = content.replace(
            '</body>',
            '    <script src="../js/icons.js"></script>\n</body>'
        )
        replacement_count += 1
        print('    + 已加入 icons.js')
    
    # 3. 處理聲音控制 emoji
    content = re.sub(
        r'<span class="sound-icon sound-off">🔇</span>',
        '<span class="sound-icon sound-off">OFF</span>',
        content
    )
    content = re.sub(
        r'<span class="sound-icon sound-on"([^>]*)>🔊</span>',
        r'<span class="sound-icon sound-on"\1>ON</span>',
        content
    )
    
    # 4. 處理 hero-title 中的 <span class="emoji">X</span>
    content = re.sub(
        r'<span class="emoji">[^<]+</span>\s*',
        '',
        content
    )
    
    # 5. 處理 <h2>emoji 標題</h2>
    for emoji, label in EMOJI_MAP.items():
        pattern = rf'(<h2>){re.escape(emoji)}\s+'
        content = re.sub(pattern, r'\1', content)
    
    # 6. 處理 demo-badge
    for emoji, label in EMOJI_MAP.items():
        pattern = rf'(<span class="demo-badge">){re.escape(emoji)}\s+'
        content = re.sub(pattern, r'\1', content)
    
    # 7. 處理 intro-header h2
    for emoji, label in EMOJI_MAP.items():
        pattern = rf'(<h2>){re.escape(emoji)}\s+'
        content = re.sub(pattern, r'\1', content)
    
    # 8. 處理 flow-explanation h3
    for emoji, label in EMOJI_MAP.items():
        pattern = rf'(<h3>){re.escape(emoji)}\s+'
        content = re.sub(pattern, r'\1', content)
    
    # 9. 處理 log-header 中的 emoji
    for emoji, label in EMOJI_MAP.items():
        pattern = rf'(<span>){re.escape(emoji)}\s+'
        content = re.sub(pattern, r'\1', content)
    
    # 10. 處理 benefit-icon 中的 emoji
    for emoji, label in EMOJI_MAP.items():
        if label:  # 只有有標籤的才替換
            pattern = rf'(<span class="benefit-icon">){re.escape(emoji)}(</span>)'
            content = re.sub(pattern, rf'\1{label}\2', content)
    
    # 11. 處理 footer-nav-icon 中的 emoji
    footer_emoji_map = {
        '📝': 'CONTENT',
        '📞': 'VOICE',
        '🎭': 'BRAND',
        '🤖': 'BOT',
        '📋': 'NOTES',
        '🧠': 'THINK',
    }
    for emoji, label in footer_emoji_map.items():
        pattern = rf'(<div class="footer-nav-icon">){re.escape(emoji)}(</div>)'
        content = re.sub(pattern, rf'\1{label}\2', content)
    
    # 12. 處理 SERVICE_CONFIG 中的節點標題 emoji
    for emoji, label in EMOJI_MAP.items():
        # title: '📊 關鍵字分析' -> title: '關鍵字分析'
        pattern = rf"(title:\s*'){re.escape(emoji)}\s+"
        content = re.sub(pattern, r"\1", content)
    
    # 13. 處理 SERVICE_CONFIG 中的 bubbleMessages emoji
    for emoji, label in EMOJI_MAP.items():
        if label:
            # '📡 連接...' -> '[CONNECT] 連接...'
            pattern = rf"'{re.escape(emoji)}\s+"
            replacement = f"'[{label}] "
            content = re.sub(pattern, replacement, content)
    
    # 14. 處理 resultPreview 中的 icon emoji
    content = re.sub(
        r"icon:\s*'🤖'",
        "icon: 'AI'",
        content
    )
    
    # 計算替換次數
    if content != original_content:
        replacement_count += len(original_content) - len(content)
        replacement_count = max(replacement_count, 1)
    
    # 寫回文件
    if content != original_content:
        try:
            filepath.write_text(content, encoding='utf-8')
            return True, replacement_count
        except Exception as e:
            print(f'  ❌ 寫入失敗: {e}')
            return False, 0
    
    return False, 0


def main():
    """主函數"""
    print('=' * 60)
    print('🔧 De-Emoji 批次處理工具 v2.0')
    print('   符合 /visionnew 規範的專業視覺升級')
    print('=' * 60)
    print()
    
    # 處理 pages 目錄下的所有 HTML 文件
    pages_dir = PROJECT_ROOT / 'pages'
    if not pages_dir.exists():
        print(f'❌ 找不到 pages 目錄: {pages_dir}')
        return
    
    html_files = list(pages_dir.glob('*.html'))
    print(f'📂 找到 {len(html_files)} 個服務頁面')
    print()
    
    total_modified = 0
    total_replacements = 0
    
    for filepath in html_files:
        print(f'📄 處理: {filepath.name}')
        is_modified, count = process_html_file(filepath)
        if is_modified:
            total_modified += 1
            total_replacements += count
            print(f'   ✅ 已更新')
        else:
            print(f'   ⏭️  無需修改或已完成')
    
    print()
    print('=' * 60)
    print(f'📊 處理完成:')
    print(f'   修改文件數: {total_modified}')
    print('=' * 60)


if __name__ == '__main__':
    main()
