"""
切割 9d43f8c.png (4x3 grid) 成 12 張小圖
只取每格上方 65%（徽章主體，不含下方文字）
輸出到 images/s12-icons/grid-icon-01.png ~ grid-icon-12.png
"""
import os
from PIL import Image

SRC = r"C:\Users\user\Desktop\9d43f8c.png"
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images", "series-icons")
COLS, ROWS = 4, 3
TOP_SKIP = 0         # 不跳頂（數字是徽章設計的一部分）
BADGE_RATIO = 0.72   # 取每格高度的 72%（完整涵蓋徽章）
OUTPUT_W = 160       # 輸出寬度，高度依比例自動算

img = Image.open(SRC).convert("RGBA")
w, h = img.size
cell_w = w // COLS
cell_h = h // ROWS
badge_h = int(cell_h * BADGE_RATIO)
output_h = int(OUTPUT_W * badge_h / cell_w)  # 保持原始比例

print(f"Source: {w}x{h}, Cell: {cell_w}x{cell_h}, Crop: {cell_w}x{badge_h} → output: {OUTPUT_W}x{output_h}")

for idx in range(12):
    col = idx % COLS
    row = idx // COLS
    x0 = col * cell_w
    y0 = row * cell_h
    x1 = x0 + cell_w
    y1 = y0 + badge_h

    cell = img.crop((x0, y0, x1, y1))
    cell = cell.resize((OUTPUT_W, output_h), Image.LANCZOS)

    out_name = f"grid-icon-{idx + 1:02d}.png"
    out_path = os.path.join(OUT_DIR, out_name)
    cell.save(out_path, "PNG")
    print(f"  Saved: {out_name}")

print(f"\nDone — 12 icons saved to {OUT_DIR}")
