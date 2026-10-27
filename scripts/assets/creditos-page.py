"""Writes the credit list of pages/creditos.html (between "creditos:inicio" and "creditos:fim") from
scripts/assets/acervo.json plus the earlier photos recorded in canais/SOURCES.md. The client type of each
use is read from public/assets/showcase/marcas.js, so the page names no brand by hand.
Run: python3 -I scripts/assets/creditos-page.py
"""
import html, json, os, re, urllib.parse

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAGE = os.path.join(ROOT, 'pages', 'creditos.html')
E = lambda s: html.escape(str(s), quote=True)

# Photos of 21/10/2026 that stay in use (canais/SOURCES.md, first tables).
ANTERIORES = [
    ('restaurante', 'Prato de feijoada completa com arroz, farofa e couve', 'Feijoada à brasileira -02', 'https://commons.wikimedia.org/wiki/File:Feijoada_%C3%A0_brasileira_-02.jpg', 'Bradleyzm', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'),
    ('restaurante', 'Prato de feijoada com arroz, couve, farofa, torresmo e laranja', 'Rice with vegetables served in restaurant', 'https://www.pexels.com/photo/rice-with-vegetables-served-in-restaurant-9494742/', 'Dalila Dalprat', 'Pexels', 'https://www.pexels.com/license/'),
    ('restaurante', 'Fachada de madeira à noite, com flores e mesas na calçada', 'Tables on a sidewalk', 'https://www.pexels.com/photo/tables-on-a-sidewalk-9538606/', 'Erik Mclean', 'Pexels', 'https://www.pexels.com/license/'),
    ('restaurante', 'Prato gratinado em panelinha de cerâmica', 'Colorful baked dish with red lid on striped mat', 'https://www.pexels.com/photo/colorful-baked-dish-with-red-lid-on-striped-mat-36580992/', 'Caio Niceas', 'Pexels', 'https://www.pexels.com/license/'),
    ('restaurante', 'Pudim de leite num prato branco', 'Brazilian pudim de leite on rustic wooden table', 'https://www.pexels.com/photo/brazilian-pudim-de-leite-on-rustic-wooden-table-34234278/', 'Beatriz Haiana', 'Pexels', 'https://www.pexels.com/license/'),
    ('clinica', 'Consultório odontológico claro, sem ninguém', 'Black and white dentist chair', 'https://www.pexels.com/photo/black-and-white-dentist-chair-4269361/', 'Cedric Fauntleroy', 'Pexels', 'https://www.pexels.com/license/'),
    ('clinica', 'Recepção com parede terracota, sofá e plantas', 'Modern waiting room with earthy tones and plant decor', 'https://www.pexels.com/photo/modern-waiting-room-with-earthy-tones-and-plant-decor-35056949/', 'Ivanna Lebediuk', 'Pexels', 'https://www.pexels.com/license/'),
    ('educacao', 'Fone com microfone sobre mesa de madeira', 'Black headset near a notebook and folders', 'https://www.pexels.com/photo/black-headset-near-a-notebook-and-folders-7658187/', 'Pavel Danilyuk', 'Pexels', 'https://www.pexels.com/license/'),
]

def tipos():
    src = open(os.path.join(ROOT, 'public', 'assets', 'showcase', 'marcas.js'), encoding='utf-8').read()
    return dict(re.findall(r"^\s+(\w+): \{ tipo: '([^']+)'", src, flags=re.M))

def uso(arquivo, t):
    nome = os.path.basename(arquivo)
    if nome.startswith('explorar-'): return 'grade do Explorar do Instagram'
    if nome.startswith('culinaria-'): return 'vídeo de culinária em que entra o anúncio'
    if nome.startswith('esporte-'): return 'miniatura de vídeo de futebol no YouTube'
    key = nome.split('-')[0]
    return 'exemplos da ' + t[key] if t.get(key, '').split()[0] in ('loja', 'agência', 'concessionária', 'gestora', 'clínica', 'escola') else 'exemplos do ' + t.get(key, key)

def titulo(origem):
    if 'commons.wikimedia.org' in origem:
        return re.sub(r'\.(jpe?g|png|webm|ogv)$', '', urllib.parse.unquote(origem.split('File:')[1]), flags=re.I).replace('_', ' ')
    return None

def item(mostra, origem, autor, lic, lic_url, usos, extra=''):
    t = titulo(origem)
    fonte = f'<a href="{E(origem)}" rel="noopener">“{E(t)}”</a>' if t else f'<a href="{E(origem)}" rel="noopener">página da foto</a>'
    return f'          <li><strong>{E(mostra)}.</strong> {fonte}, de {E(autor)}, <a href="{E(lic_url)}" rel="noopener license">{E(lic)}</a>. {extra}Onde aparece: {E(", ".join(usos))}.</li>'

def main():
    t = tipos()
    acervo = json.load(open(os.path.join(ROOT, 'scripts', 'assets', 'acervo.json'), encoding='utf-8'))
    grupos = {}
    for f in acervo['fotos'] + [dict(v, video=True) for v in acervo.get('videos', [])]:
        g = grupos.setdefault(f['origem'], dict(f, usos=[]))
        u = uso(f['arquivo'], t)
        if u not in g['usos']: g['usos'].append(u)
    commons = [g for g in grupos.values() if 'wikimedia' in g['origem']]
    stock = [g for g in grupos.values() if 'stocksnap' in g['origem']]
    out = ['        <section aria-labelledby="commons">', '          <h2 id="commons">Wikimedia Commons</h2>',
           '          <p>Fotos e vídeo sob licenças Creative Commons com atribuição. Todos foram recortados e reduzidos para caber nos formatos dos anúncios; os vídeos ficaram sem som. Os recortes de originais CC BY-SA continuam sob CC BY-SA 4.0.</p>', '          <ul>']
    for g in commons: out.append(item(g['mostra'], g['origem'], g['autor'], g['licenca'], g['licenca_url'], g['usos'], 'Vídeo cortado em ' + str(g['duracao']) + ' s. ' if g.get('video') else ''))
    for key, mostra, _, origem, autor, lic, url in ANTERIORES:
        if 'wikimedia' in origem: out.append(item(mostra, origem, autor, lic, url, [uso(key + '-', t)]))
    out += ['          </ul>', '        </section>', '', '        <section aria-labelledby="pexels">', '          <h2 id="pexels">Pexels</h2>',
            '          <p>Licença do Pexels: uso livre, inclusive comercial, sem atribuição obrigatória. O crédito fica aqui por cortesia.</p>', '          <ul>']
    for key, mostra, nome, origem, autor, lic, url in ANTERIORES:
        if 'pexels' in origem: out.append(f'          <li><strong>{E(mostra)}.</strong> <a href="{E(origem)}" rel="noopener">“{E(nome)}”</a>, de {E(autor)}, <a href="{E(url)}" rel="noopener license">licença do Pexels</a>. Onde aparece: {E(uso(key + "-", t))}.</li>')
    out += ['          </ul>', '        </section>', '', '        <section aria-labelledby="stocksnap">', '          <h2 id="stocksnap">StockSnap</h2>',
            '          <p>Domínio público (CC0 1.0): uso livre, sem atribuição obrigatória. O crédito fica aqui por cortesia.</p>', '          <ul>']
    for g in stock: out.append(item(g['mostra'], g['origem'], g['autor'], 'CC0 1.0', g['licenca_url'], g['usos']))
    out += ['          </ul>', '        </section>']
    page = open(PAGE, encoding='utf-8').read()
    new = re.sub(r'(<!-- creditos:inicio -->\n).*?(<!-- creditos:fim -->)', lambda m: m.group(1) + '\n'.join(out) + '\n' + m.group(2), page, flags=re.S)
    open(PAGE, 'w', encoding='utf-8').write(new)
    print('creditos.html:', len(commons), 'do Commons,', len(stock), 'do StockSnap,', len(ANTERIORES), 'anteriores')

if __name__ == '__main__': main()
