"""Contact sheet of the licensed collection (scripts/assets/acervo.json) for the visual review:
no identifiable face, logo, plate or legible text, and each photo matching its copy.
Run: python3 -I scripts/assets/mosaic.py <output.jpg>
"""
import json, os, sys
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
BASE = os.path.join(ROOT, 'public', 'assets', 'portfolio')

def main():
    acervo = json.load(open(os.path.join(ROOT, 'scripts', 'assets', 'acervo.json'), encoding='utf-8'))
    files = [f['arquivo'] for f in acervo['fotos']] + [v['arquivo'] + '.webp' for v in acervo.get('videos', [])]
    tile, pad, cols = 300, 34, 6
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (tile + 10) + 10, rows * (tile + pad) + 10), '#f2f2f2')
    draw = ImageDraw.Draw(sheet)
    for n, name in enumerate(files):
        x, y = 10 + (n % cols) * (tile + 10), 10 + (n // cols) * (tile + pad)
        path = os.path.join(BASE, name)
        if not os.path.exists(path): draw.text((x, y + 20), 'faltando: ' + name, fill='red'); continue
        im = Image.open(path).convert('RGB'); w, h = im.size; im.thumbnail((tile, tile))
        sheet.paste(im, (x + (tile - im.size[0]) // 2, y + (tile - im.size[1]) // 2))
        draw.text((x, y + tile + 4), f"{os.path.basename(name)[:44]}", fill='black')
        draw.text((x, y + tile + 17), f"{w}x{h}, {os.path.getsize(path) // 1024} KB", fill='#555')
    sheet.save(sys.argv[1], quality=86); print(sys.argv[1], len(files), 'arquivos')

if __name__ == '__main__': main()
