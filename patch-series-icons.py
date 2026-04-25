"""
把切割好的 grid-icon-01~12.png 塞進 系列總覽/index.html 的每張 article-card
放在 .card-top 上方，並在 CSS 加入 .card-icon 樣式
"""
import re, os

HTML_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "系列總覽", "index.html")

html = open(HTML_PATH, encoding="utf-8").read()

# 1. 加 CSS（插在 .card-top { 之前）
ICON_CSS = """      .card-icon {
        width: 72px;
        height: 72px;
        border-radius: 12px;
        object-fit: cover;
        margin-bottom: 4px;
      }

      """

if ".card-icon {" not in html:
    html = html.replace("      .card-top {", ICON_CSS + "      .card-top {", 1)
    print("CSS added")

# 2. 在每張卡片的 <div class="card-top"> 前插入 <img class="card-icon">
#    卡片順序：01~12，依照 <!-- 01 --> ~ <!-- 12 --> 的順序
count = 0

def make_img(n):
    return f'<img class="card-icon" src="../images/s12-icons/grid-icon-{n:02d}.png" alt="圖示{n:02d}" loading="lazy" />\n          '

def replacer(m):
    global count
    count += 1
    icon_tag = make_img(count)
    return icon_tag + m.group(0)

html = re.sub(r'<div class="card-top">', replacer, html)
print(f"Inserted {count} icons")

open(HTML_PATH, "w", encoding="utf-8").write(html)
print(f"Saved: {HTML_PATH}")
