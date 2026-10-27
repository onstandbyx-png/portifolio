"""Licensed photo collection for "Sua oferta. Em cada canal.": crops and encodes every photo
listed in scripts/assets/acervo.json into public/assets/portfolio/ as WebP without metadata.
The downloads stay outside the repository (one empty folder per batch); pass that folder.
Run from any folder: python3 -I scripts/assets/convert-photos.py <download-dir> [file-filter]
Crop: "caixa" [x0, y0, x1, y1] in source pixels, or "foco" [fx, fy] (0..1) plus "zoom"
(1 = largest crop of the target ratio). Quality starts at 82 and drops to fit "maxKB".
"retoque" [[x0, y0, x1, y1], ...] paints a source box with the mean color of the strip just above it
(used to erase a product label on a plain bezel), then softens the edge.
"""
import json, os, sys
from PIL import Image, ImageFilter, ImageOps, ImageStat

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'public', 'assets', 'portfolio')

def box_for(item, w, h):
    if 'caixa' in item: return tuple(item['caixa'])
    tw, th = item['tamanho']; ratio = tw / th
    cw, ch = (w, w / ratio) if w / h < ratio else (h * ratio, h)
    z = item.get('zoom', 1); cw, ch = cw / z, ch / z
    fx, fy = item.get('foco', [0.5, 0.5])
    x0 = min(max(fx * w - cw / 2, 0), w - cw); y0 = min(max(fy * h - ch / 2, 0), h - ch)
    return (round(x0), round(y0), round(x0 + cw), round(y0 + ch))

def main():
    src_dir = sys.argv[1]; only = sys.argv[2] if len(sys.argv) > 2 else ''
    items = json.load(open(os.path.join(ROOT, 'scripts', 'assets', 'acervo.json'), encoding='utf-8'))['fotos']
    for item in items:
        if only and only not in item['arquivo']: continue
        im = ImageOps.exif_transpose(Image.open(os.path.join(src_dir, item['fonte']))).convert('RGB')
        for x0, y0, x1, y1 in item.get('retoque', []):
            color = tuple(int(c) for c in ImageStat.Stat(im.crop((x0, y0 - 6, x1, y0 - 2))).mean)
            im.paste(color, (x0, y0, x1, y1))
            pad = (x0 - 3, y0 - 3, x1 + 3, y1 + 3)
            im.paste(im.crop(pad).filter(ImageFilter.GaussianBlur(1.2)), pad[:2])
        b = box_for(item, *im.size); crop = im.crop(b); tw, th = item['tamanho']
        up = tw / crop.size[0]
        out = crop.resize((tw, th), Image.LANCZOS)
        if item.get('nitidez'): out = out.filter(ImageFilter.UnsharpMask(1.2, item['nitidez'], 2))
        dest = os.path.join(OUT, item['arquivo']); os.makedirs(os.path.dirname(dest), exist_ok=True)
        for q in range(82, 49, -2):
            out.save(dest, 'WEBP', quality=q, method=6)
            if os.path.getsize(dest) <= item['maxKB'] * 1024: break
        kb = os.path.getsize(dest) / 1024
        flag = ' ACIMA DO LIMITE' if kb > item['maxKB'] else ''
        print(f"{item['arquivo']}: fonte {im.size[0]}x{im.size[1]}, caixa {b}, escala {up:.2f}, q{q}, {kb:.0f} KB{flag}")

if __name__ == '__main__': main()
