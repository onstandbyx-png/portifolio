"""Short muted loops for the video formats of "Sua oferta. Em cada canal.": cuts each clip listed in
scripts/assets/acervo.json ("videos") from a licensed source kept outside the repository and writes
<arquivo>.webm (VP9, crf 36), <arquivo>.mp4 (H.264, crf 28, faststart; "crf_webm", "crf_mp4" and a light
denoise "filtro" lower the weight of grainy clips to the 1 MB limit) and <arquivo>.webp (poster of
the first frame) into public/assets/portfolio/. No audio track is kept.
Run from any folder: python3 -I scripts/assets/convert-videos.py <download-dir> [file-filter]
"""
import json, os, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'public', 'assets', 'portfolio')

def run(args):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *args], check=True)

def main():
    src_dir = sys.argv[1]; only = sys.argv[2] if len(sys.argv) > 2 else ''
    videos = json.load(open(os.path.join(ROOT, 'scripts', 'assets', 'acervo.json'), encoding='utf-8'))['videos']
    for v in videos:
        if only and only not in v['arquivo']: continue
        w, h = v['tamanho']; base = os.path.join(OUT, v['arquivo']); os.makedirs(os.path.dirname(base), exist_ok=True)
        vf = f"crop={v['recorte']},scale={w}:{h}:flags=lanczos," + (v['filtro'] + ',' if v.get('filtro') else '') + "fps=30,format=yuv420p"
        cut = ['-ss', str(v['inicio']), '-t', str(v['duracao']), '-i', os.path.join(src_dir, v['fonte']), '-an', '-vf', vf]
        run([*cut, '-c:v', 'libvpx-vp9', '-crf', str(v.get('crf_webm', 36)), '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', base + '.webm'])
        run([*cut, '-c:v', 'libx264', '-crf', str(v.get('crf_mp4', 28)), '-preset', 'slow', '-profile:v', 'high', '-movflags', '+faststart', base + '.mp4'])
        run(['-ss', str(v['inicio']), '-i', os.path.join(src_dir, v['fonte']), '-frames:v', '1', '-vf', vf.replace(',fps=30,format=yuv420p', ''), '-c:v', 'libwebp', '-quality', '78', base + '.webp'])
        sizes = ', '.join(f"{ext} {os.path.getsize(base + '.' + ext) // 1024} KB" for ext in ('webm', 'mp4', 'webp'))
        print(f"{v['arquivo']}: {v['duracao']} s a partir de {v['inicio']} s, recorte {v['recorte']}, {sizes}")

if __name__ == '__main__': main()
