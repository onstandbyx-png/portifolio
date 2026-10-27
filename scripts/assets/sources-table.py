"""Rewrites the licensed-collection tables of public/assets/portfolio/canais/SOURCES.md (between the
"acervo:inicio" and "acervo:fim" markers) from scripts/assets/acervo.json, so the record of origin,
author, licence and crop always matches what convert-photos.py and convert-videos.py produce.
Run: python3 -I scripts/assets/sources-table.py <download-dir>
"""
import json, os, re, sys
sys.dont_write_bytecode = True
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from importlib import import_module
box_for = import_module('convert-photos').box_for

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SOURCES = os.path.join(ROOT, 'public', 'assets', 'portfolio', 'canais', 'SOURCES.md')

def main():
    src_dir = sys.argv[1]
    acervo = json.load(open(os.path.join(ROOT, 'scripts', 'assets', 'acervo.json'), encoding='utf-8'))
    rows = ['| Arquivo | O que mostra | Substitui ou preenche | Origem (página) | Autor | Licença | Data | Recorte e edição |', '|---|---|---|---|---|---|---|---|']
    for f in acervo['fotos']:
        im = Image.open(os.path.join(src_dir, f['fonte'])); b = box_for(f, *im.size)
        edit = f"Do arquivo baixado ({f['baixado']}; {im.size[0]} x {im.size[1]}): caixa {b}, para {f['tamanho'][0]} x {f['tamanho'][1]}"
        if f.get('retoque'): edit += '. Retoque: ' + ('nome do modelo apagado da moldura da tela' if 'creator15-branco' in f['arquivo'] else 'barra de menus do programa na tela pintada de escuro, sem logotipo nem nomes')
        lic = f"[{f['licenca']}]({f['licenca_url']})"
        rows.append(f"| `{os.path.basename(f['arquivo'])}` ({f['tamanho'][0]} x {f['tamanho'][1]}) | {f['mostra']} | {f['substitui']} | {f['origem']} | {f['autor']} | {lic} | {f.get('data', 'não informada (original ' + f['original'] + ')')} | {edit} |")
    vrows = ['| Arquivo | O que mostra | Substitui ou preenche | Origem (página) | Autor | Licença | Data | Corte |', '|---|---|---|---|---|---|---|---|']
    for v in acervo.get('videos', []):
        lic = f"[{v['licenca']}]({v['licenca_url']})"
        vrows.append(f"| `{os.path.basename(v['arquivo'])}` .webm, .mp4 e .webp ({v['tamanho'][0]} x {v['tamanho'][1]}, {v['duracao']} s, sem áudio) | {v['mostra']} | {v['substitui']} | {v['origem']} | {v['autor']} | {lic} | {v.get('data', 'não informada')} | {v['baixado']}; trecho de {v['inicio']} s a {v['inicio'] + v['duracao']} s, recorte {v['recorte']}, pôster do primeiro quadro |")
    block = '\n'.join(rows) + '\n\n### Vídeos curtos (pasta `video/`)\n\n' + ('\n'.join(vrows) if acervo.get('videos') else 'Nenhum vídeo ainda.')
    text = open(SOURCES, encoding='utf-8').read()
    new = re.sub(r'(<!-- acervo:inicio -->\n).*?(<!-- acervo:fim -->)', lambda m: m.group(1) + block + '\n' + m.group(2), text, flags=re.S)
    if new == text and '<!-- acervo:inicio -->' not in text: sys.exit('marcadores acervo:inicio e acervo:fim ausentes em SOURCES.md')
    open(SOURCES, 'w', encoding='utf-8').write(new); print('SOURCES.md:', len(acervo['fotos']), 'fotos,', len(acervo.get('videos', [])), 'vídeos')

if __name__ == '__main__': main()
