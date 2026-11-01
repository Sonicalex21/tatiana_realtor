"""
Скрипт повторного рендеринга визиток (горизонтальной 1536x1024 и вертикальной 1080x1350)
в форматах PNG и JPEG высокой четкости с помощью Headless Chrome/Edge.
"""

import os
import subprocess
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(BASE_DIR, '..'))
DIST_DIR = os.path.join(BASE_DIR, 'dist')
os.makedirs(DIST_DIR, exist_ok=True)

CHROME_PATHS = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
]

chrome_bin = None
for p in CHROME_PATHS:
    if os.path.exists(p):
        chrome_bin = p
        break

if not chrome_bin:
    raise RuntimeError("Chrome или Edge не найдены в системе!")

CARDS = [
    {
        "name": "business-card-horizontal-1536x1024",
        "html": os.path.join(BASE_DIR, "card-horizontal.html"),
        "width": 1536,
        "height": 1024
    },
    {
        "name": "business-card-vertical-1080x1350",
        "html": os.path.join(BASE_DIR, "card-vertical.html"),
        "width": 1080,
        "height": 1350
    }
]

print(f"Используем браузер: {chrome_bin}")

for card in CARDS:
    out_png = os.path.join(DIST_DIR, f"{card['name']}.png")
    out_jpg = os.path.join(DIST_DIR, f"{card['name']}.jpg")
    html_url = card['html']
    w, h = card['width'], card['height']

    print(f"\nРендеринг {card['name']} ({w}x{h})...")
    cmd = [
        chrome_bin,
        "--headless=new",
        f"--screenshot={out_png}",
        f"--window-size={w},{h}",
        "--hide-scrollbars",
        "--disable-gpu",
        html_url
    ]
    subprocess.run(cmd, check=True)

    if os.path.exists(out_png):
        with Image.open(out_png) as im:
            rgb_im = im.convert('RGB')
            rgb_im.save(out_jpg, quality=95)
        print(f" -> Успешно сохранены:\n    {out_png}\n    {out_jpg}")
    else:
        print(f"Ошибка: файл {out_png} не создан!")

print("\nВсе визитки успешно сформированы!")
