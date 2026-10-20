/* /criadores · unit contracts (SPEC 3.A, 4.A, 5.1, 8.2; copy-criadores.md).
 * tests/pages.test.mjs already covers the route, CSP, shell markup, /assets
 * references and the shared text guards for this page. This file pins the
 * page itself: copy, section rhythm, track switch, form fields, the message
 * and both handoff links, and the honest defaults (no creator pool, no numbers). */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const html = read('pages/criadores.html').replace(/<!--[\s\S]*?-->/g, '');
const decode = text => text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const textOf = fragment => decode(fragment.replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const visible = textOf(html);
/** Inner HTML of the first element whose opening tag matches `open` (balanced on the tag name). */
function block(open, source = html) {
  const start = source.search(open);
  assert.ok(start >= 0, `block ${open}`);
  const tag = source.slice(start).match(/^<([a-z0-9]+)/i)[1];
  const pattern = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  pattern.lastIndex = start;
  let depth = 0, match;
  while ((match = pattern.exec(source))) {
    depth += match[1] ? -1 : 1;
    if (depth === 0) return source.slice(start, match.index + match[0].length);
  }
  throw new Error(`unbalanced ${tag}`);
}

await import('../public/assets/profile.js');
const kit = await import('../public/assets/pages/criadores-kit.js');
const handoff = await import('../public/assets/pages/handoff.js');
const EXAMPLE = [
  'Oi, Smile! Vim pela página de criadores.',
  'Meu perfil principal: @ana.ceramica (Instagram)',
  'Quero ajuda com: mídia kit e proposta para marcas',
  'Prazo: este mês',
  'Pode me contar como funciona?',
  '— Tenho 18 anos ou mais e li o aviso de privacidade (versão 2026-10).'
].join('\n');

/* ---------- message and handoff (SPEC 4.A, copy §8.4) ---------- */
test('the @ field normalizes pasted links and explains every error in pt-BR', () => {
  for (const [raw, handle] of [['@ana', 'ana'], ['  ana.ceramica ', 'ana.ceramica'], ['https://www.tiktok.com/@ana.ceramica?lang=pt', 'ana.ceramica'],
    ['instagram.com/ana_ceramica/', 'ana_ceramica'], ['www.x.com/@a.b', 'a.b'], ['http://site.example/perfil/ana', 'ana']])
    assert.equal(kit.normalizeHandle(raw), handle, raw);
  assert.equal(kit.handleError(''), 'Digite o @ do seu perfil principal.');
  assert.equal(kit.handleError('   @ '), 'Digite o @ do seu perfil principal.');
  assert.equal(kit.handleError('www.tiktok.com/'), 'Digite o @ do seu perfil principal.', 'a profile link without a path has no @');
  assert.equal(kit.handleError('ana ceramica'), 'Use só letras, números, ponto e sublinhado. Sem espaços.');
  assert.equal(kit.handleError('ana-ceramica!'), 'Use só letras, números, ponto e sublinhado. Sem espaços.');
  assert.equal(kit.handleError('a'), 'O @ precisa ter de 2 a 30 caracteres.');
  assert.equal(kit.handleError('a'.repeat(31)), 'O @ precisa ter de 2 a 30 caracteres.');
  assert.equal(kit.handleError('a'.repeat(30)), '');
  assert.equal(kit.handleError('https://www.tiktok.com/@ana.ceramica'), '');
  assert.deepEqual(kit.KIT_ERRORS, {plataforma: 'Escolha a plataforma principal.', preciso: 'Escolha pelo menos uma opção em “Preciso de”.', maior: 'Confirme que você tem 18 anos ou mais.'});
  assert.equal(kit.guardianHelp('smillepls@gmail.com'), 'Por enquanto atendo só maiores de 18 anos. Se você é responsável por um criador menor de idade, escreva para smillepls@gmail.com e eu converso com você.');
});

test('the preview handle is escaped to allowed characters and never empty', () => {
  assert.equal(kit.previewHandle(''), 'seuperfil');
  assert.equal(kit.previewHandle('@teste.x'), 'teste.x');
  assert.equal(kit.previewHandle('<img src=x onerror=1>'), 'imgsrcxonerror1');
  assert.equal(kit.previewHandle('a'.repeat(50)).length, 30);
});

test('summary and message follow copy §8.1 and §8.4 (optional lines drop out)', () => {
  assert.equal(kit.itemsText(['Mídia kit', 'Proposta para marcas', 'Página de links']), 'mídia kit, proposta para marcas e página de links');
  assert.equal(kit.itemsText(['Ainda não sei']), 'ainda não sei, quero conversar');
  assert.deepEqual(kit.summarize({perfil: 'https://x.com/@ana', plataforma: 'X', preciso: ['Roteiro', 'Edição'], prazo: 'Urgente'}),
    {lines: ['@ana · X', 'Preciso de: roteiro e edição', 'Prazo: urgente'], count: 4});
  assert.deepEqual(kit.summarize({}), {lines: [], count: 0});
  assert.equal(kit.countLabel(1), '1 escolha');
  assert.equal(kit.countLabel(3), '3 escolhas');

  const values = {perfil: 'https://www.instagram.com/ana.ceramica/', plataforma: 'Instagram', preciso: ['Mídia kit', 'Proposta para marcas'], prazo: 'Este mês'};
  const result = handoff.buildHandoff(kit.composeKit(values));
  assert.equal(result.text, EXAMPLE, 'the filled example of copy §8.4');
  assert.equal(result.whatsapp, `https://wa.me/5511985568208?text=${encodeURIComponent(EXAMPLE)}`);
  assert.equal(result.email, `mailto:smillepls@gmail.com?subject=${encodeURIComponent('Kit para marcas · @ana.ceramica')}&body=${encodeURIComponent(EXAMPLE.replace(/\n/g, '\r\n'))}`);
  assert.ok(result.email.includes('%0D%0A') && !/%0A/.test(result.email.replace(/%0D%0A/g, '')), 'CRLF only');

  const minimal = handoff.buildHandoff(kit.composeKit({perfil: 'ana', plataforma: 'Outra', preciso: ['Ainda não sei'], prazo: ''}));
  assert.equal(minimal.text, ['Oi, Smile! Vim pela página de criadores.', 'Meu perfil principal: @ana (Outra)', 'Quero ajuda com: ainda não sei, quero conversar', 'Pode me contar como funciona?', kit.CLOSING].join('\n'));
  assert.equal(minimal.subject, 'Kit para marcas · @ana');

  const fromDm = handoff.buildHandoff(kit.composeKit(values, {origin: handoff.refOrigin('?ref=dm')})).text.split('\n');
  assert.deepEqual(fromDm.slice(4, 6), ['Origem: link que você me mandou', 'Pode me contar como funciona?']);
  assert.equal(handoff.buildHandoff(kit.composeKit(values, {origin: handoff.refOrigin('?ref=spam')})).text, EXAMPLE, 'an unknown ?ref= adds nothing');
  assert.ok(kit.CLOSING.endsWith(`(versão ${handoff.NOTICE_VERSION}).`));
});

test('the no-JS e-mail template (copy §8.5) is the same href in the HTML and in the module', () => {
  assert.equal(kit.NOJS_BODY, ['Oi, Smile! Vim pela página de criadores.', 'Meu perfil principal: @', 'Plataforma:', 'Quero ajuda com:', '— Tenho 18 anos ou mais e li o aviso de privacidade (versão 2026-10).'].join('\n'));
  const expected = handoff.mailtoHref({subject: 'Kit para marcas', body: kit.NOJS_BODY});
  const links = [...html.matchAll(/<a\b[^>]*\bdata-kit-mailto\b[^>]*>/g)].map(match => decode(match[0].match(/href="([^"]+)"/)[1]));
  assert.equal(links.length, 2, 'no-JS fallback and the final strip');
  for (const href of links) {
    assert.equal(href, expected);
    assert.ok(href.includes('%0D%0A'));
    assert.equal(decodeURIComponent(href.split('&body=')[1]), kit.NOJS_BODY.replace(/\n/g, '\r\n'));
  }
  const fallback = block(/<p\b[^>]*data-nojs-fallback/);
  assert.match(textOf(fallback), /^Sem JavaScript\? Escreva para smillepls@gmail\.com com seu @, a plataforma principal e o que você precisa\. Escrever e-mail ↗$/);
});

/* ---------- page markup ---------- */
test('head metadata comes from copy §0', () => {
  assert.ok(html.includes('<title>Para criadores: kit para fechar com marcas · Smile N</title>'));
  assert.ok(html.includes('<meta name="description" content="Mídia kit, proposta para marcas, página de links, identidade, roteiro e edição para quem cria no TikTok, Instagram, X, Facebook e Snapchat. Você revisa a mensagem antes de enviar.">'));
  assert.ok(html.includes('<meta property="og:title" content="Seu perfil pronto para fechar com marcas">'));
  assert.ok(html.includes('<meta property="og:description" content="Mídia kit, proposta e página de links sob medida, com os seus números reais.">'));
  assert.ok(html.includes('<link rel="canonical" href="https://portifolio-github-production.up.railway.app/criadores">'));
  assert.ok(html.includes('<meta property="og:url" content="https://portifolio-github-production.up.railway.app/criadores">'));
  assert.ok(html.includes('<script type="module" src="/assets/pages/criadores.js"></script>'));
  assert.equal((html.match(/<script type="module"/g) || []).length, 1, 'one module entry');
});

test('header, menu and track switch (C0)', () => {
  assert.match(html, /<nav class="pg-nav"[^>]*>.*<a href="\/criadores" aria-current="page">Para criadores<\/a>/);
  assert.equal((block(/<nav class="pg-nav"/).match(/aria-current/g) || []).length, 1);
  assert.match(html, /<a class="pg-btn pg-btn--primary pg-header-cta" href="#montar" data-header-cta>Montar meu kit <span aria-hidden="true">↓<\/span><\/a>/);
  const menu = block(/<div class="pg-menu" id="mobile-nav"/);
  assert.match(menu, /<a class="pg-btn pg-btn--primary" href="#montar" data-menu-item>Montar meu kit/);
  const track = block(/<nav class="pg-track[^"]*" aria-label="Escolha a página do seu formato"/);
  assert.deepEqual([...track.matchAll(/<a href="([^"]+)"([^>]*)>([^<]+)<\/a>/g)].map(m => [m[1], m[2].trim(), m[3]]),
    [['/criadores', 'aria-current="page"', 'Redes sociais'], ['/criadores/ao-vivo', '', 'Vídeo e live']]);
  const hero = block(/<section\b[^>]*data-hero/);
  assert.ok(hero.includes(track), 'the track switch opens the hero');
});

test('sections follow SPEC 3.A in order and colour rhythm; the creator pool stays off', () => {
  const main = block(/<main\b/);
  const sections = [...main.matchAll(/<section class="pg-section pg-section--(papel|floresta)[^"]*"[^>]*?(?:id="([^"]+)")?[^>]*aria-labelledby="([^"]+)"/g)].map(m => [m[1], m[3]]);
  assert.deepEqual(sections, [
    ['floresta', 'cr-titulo'], ['papel', 'cr-para-quem'], ['floresta', 'cr-recebe'], ['papel', 'cr-previa'], ['papel', 'cr-como'],
    ['floresta', 'cr-pratica'], ['papel', 'cr-quem-faz'], ['floresta', 'cr-montar'], ['papel', 'cr-perguntas'], ['floresta', 'cr-final-titulo']
  ]);
  assert.match(main, /<section class="pg-section pg-section--papel cr-preview" id="exemplo"/);
  assert.match(main, /<section class="pg-section pg-section--floresta cr-build" id="montar"/);
  assert.doesNotMatch(html, /banco-de-criadores/, 'C11 is off in v1 (Q1)');
  assert.doesNotMatch(visible, /Às vezes monto elenco|Ver o banco de criadores/);
  assert.ok(visible.includes('Hoje meu foco é o seu material: kit, proposta, conteúdo e presença. Se eu abrir um banco de criadores para campanhas, aviso aqui, com cadastro separado.'));
  assert.doesNotMatch(visible, /Não peço número mínimo de seguidores/, 'Q6 stays off');
});

test('copy is published verbatim (copy-criadores.md §1–§11)', () => {
  for (const sentence of [
    'Para criadores · Redes sociais', 'Seu perfil pronto para fechar com marcas.',
    'Mídia kit, proposta e página de links sob medida, com os seus números reais. Roteiro e edição quando você precisar.',
    'Três escolhas. Você revisa a mensagem antes de abrir o WhatsApp.', 'Ver um exemplo ↓',
    'Para quem publica no TikTok, Instagram, X, Facebook e Snapchat.', 'Ver o que a marca vê', 'Voltar para a capa',
    'Exemplo ilustrativo. Os números entram a partir dos seus insights.',
    'Para quem já cria e quer negociar melhor.', 'Funciona com ou sem agência. Eu cuido do material, não do seu contrato.', 'Atendo maiores de 18 anos.',
    'O que você recebe.', 'Três frentes. Você escolhe uma ou todas.', 'Arraste, use as setas ou toque no cartão para ver o que vem.',
    'Guia de publi identificada, no formato que o CONAR orienta', 'Landing page para lançamento ou serviço',
    'Veja seu kit tomar forma.', 'Digite seu @. A prévia muda aqui mesmo, no seu aparelho. Nada é enviado.',
    'Só para a prévia. Não guardo o que você digita aqui.', 'Seus números entram aqui, direto dos insights.',
    'Proposta para Ateliê Exemplo', 'Ateliê Exemplo · exemplo fictício para mostrar o formato. Não é cliente real.', 'Gostou? Montar meu kit ↓',
    'Você monta a mensagem', 'Três escolhas aqui na página. Você revisa e envia pelo WhatsApp ou pelo e-mail.',
    'Duas demonstrações com o Ateliê Exemplo, uma marca fictícia de cerâmica feita à mão.',
    'Do barro à mesa: minha primeira peça no torno.', '#publi Fiz minha primeira tigela no Ateliê Exemplo. Conto tudo no vídeo.',
    '#publi Passei a tarde no Ateliê Exemplo aprendendo torno. Três coisas que ninguém me contou:',
    'Na publicação de verdade, use o rótulo da própria plataforma.', 'ABERTURA : Eu ia jogar esse pote rachado fora.',
    'CONVITE : Salve para lembrar quando for marcar a sua.', 'Não tem vencedor aqui. Teste as duas no seu perfil e compare nos insights da sua conta.',
    'Eu sou Smile N, diretor criativo e redator. Escrevo, desenho e monto a página. Você fala direto com quem cria.',
    'Ver trabalhos no portfólio →', 'Publi identificada desde o primeiro quadro.', 'Ler o guia do CONAR ↗',
    'Não sou parceiro oficial, agência credenciada nem representante de TikTok, Instagram, Facebook, Meta, Snapchat ou X. Os nomes aparecem só para indicar onde seu conteúdo roda. As marcas pertencem aos seus titulares. Não peço senha nem acesso à sua conta.',
    'Monte seu kit.', 'Pode colar o link do perfil. Eu pego só o @.', 'Para quando? (opcional)', 'Tenho 18 anos ou mais.',
    'Seu resumo aparece aqui conforme você escolhe.', 'Este resumo não gera preço.', 'Revisar mensagem',
    'Você revisa a mensagem antes de enviar. Uso seu @ e suas respostas só para preparar a proposta que você pediu. Nada sai daqui até você tocar em enviar no WhatsApp ou no e-mail. Como trato seus dados →',
    'Sua mensagem está pronta.', 'Confira abaixo. Ao tocar no botão, ela abre no WhatsApp para você revisar e enviar. Nada é enviado daqui.',
    'Abrir no WhatsApp ↗', 'Prefiro e-mail ↗', 'Copiar mensagem', 'Editar respostas ↑',
    'No computador, o link abre o WhatsApp Web ou o aplicativo.',
    'Eu respondo com algumas perguntas e, se fizer sentido, uma proposta por escrito. Tenha à mão prints dos insights da sua conta.',
    'Perguntas frequentes.', 'Quando a marca pedir seu mídia kit, você já tem.', 'Montar meu kit ↑',
    'Prefere e-mail? Escrever para smillepls@gmail.com ↗', 'Faz live? Ver a página para quem transmite →',
    'Sem vínculo com TikTok, Instagram, Facebook, Meta, Snapchat ou X. As marcas citadas pertencem aos seus titulares.'
  ]) assert.ok(visible.includes(sentence), sentence);
  const faq = block(/<div class="pg-accordion-list">/);
  assert.equal((faq.match(/<details class="pg-accordion" name="faq"/g) || []).length, 10, 'ten FAQ items, one open at a time');
  assert.deepEqual([...faq.matchAll(/<span class="pg-accordion-q">([^<]+)<\/span>/g)].map(m => m[1]), [
    'Preciso ter muitos seguidores?', 'Já tenho agência. Posso contratar?', 'Você garante publis ou campanhas?', 'Quanto custa?',
    'Uso meus números reais?', 'Você é parceiro do TikTok, da Meta ou de outra plataforma?', 'O que acontece com meus dados?',
    'Você atende menor de idade?', 'Você chama criadores para campanhas?', 'E se eu fizer live?'
  ]);
  assert.match(faq, /<a href="\/criadores\/ao-vivo">Ver a página para quem transmite/);
  assert.match(faq, /<a href="\/privacidade">aviso de privacidade/);
});

test('trust rules: no invented numbers, no CONAR approval, official guide only, fictional client only', () => {
  assert.doesNotMatch(visible, /aprovado pelo CONAR|parceiro oficial do|credenciad[oa] (?:pelo|pela)|vencedor[^ ]* (?:é|foi)|\d+\s?%|R\$|seguidores atendidos/i);
  assert.equal((visible.match(/vencedor/gi) || []).length, 1, 'only "Não tem vencedor aqui."');
  assert.match(html, /href="https:\/\/conar\.wpenginepowered\.com\/wp-content\/uploads\/2026\/05\/260525_GUIA_INFLUENCIADORES_CONAR_v6\.pdf" target="_blank" rel="noopener noreferrer">Ler o guia do CONAR/);
  const hero = textOf(block(/<section\b[^>]*data-hero/));
  assert.doesNotMatch(hero, /\d/, 'no follower count, reach or price in the hero');
  const profile = textOf(block(/<div class="cr-view cr-view--perfil"/));
  assert.doesNotMatch(profile, /\d/, 'metrics are placeholders, never values');
  assert.equal((profile.match(/seus números/g) || []).length, 3);
  const kitView = textOf(block(/<div class="cr-view cr-view--kit"/));
  assert.deepEqual(kitView.match(/\d+/g), ['1', '3'], 'the only digits in the Kit view are the example deliverable "1 vídeo vertical + 3 stories"');
  // Demos: the fictional Ateliê Exemplo is the only brand, always labelled as fictional.
  assert.ok((visible.match(/Ateliê Exemplo · exemplo fictício para mostrar o formato\. Não é cliente real\./g) || []).length >= 2);
  for (const view of ['vertical', 'feed', 'text']) {
    const piece = textOf(block(new RegExp(`<div class="fm-view fm-view--${view}"`)));
    assert.ok(piece.includes('Parceria paga') && piece.includes('#publi'), `${view}: identification on the first frame`);
  }
  assert.doesNotMatch(html, /<img\b/i, 'no images, no platform logos');
});

test('form fields are limited to SPEC 4.A and nothing is ever sent', () => {
  const form = block(/<form class="cr-form"/);
  assert.match(form, /^<form class="cr-form" id="cr-form" novalidate>/);
  assert.doesNotMatch(form, /\b(?:action|method)=/);
  assert.deepEqual([...form.matchAll(/<(?:input|textarea|select)\b[^>]*>/g)].map(m => (m[0].match(/name="([^"]+)"/) || [])[1]), ['perfil', 'maior']);
  assert.match(form, /<input class="pg-input" id="cr-perfil" name="perfil" type="text" inputmode="text" autocomplete="off" autocapitalize="none" spellcheck="false"/);
  assert.match(form, /<input type="checkbox" id="cr-maior" name="maior">/, '18+ starts unchecked');
  const groups = [...form.matchAll(/<fieldset class="pg-fieldset" id="([^"]+)" data-chips="(single|multi)" data-name="([^"]+)"([^>]*)>([\s\S]*?)<\/fieldset>/g)]
    .map(m => ({id: m[1], mode: m[2], name: m[3], optional: m[4].includes('data-optional'), chips: [...m[5].matchAll(/data-value="([^"]+)"/g)].map(c => c[1])}));
  assert.deepEqual(groups, [
    {id: 'cr-plataforma', mode: 'single', name: 'plataforma', optional: false, chips: [...kit.PLATFORMS]},
    {id: 'cr-preciso', mode: 'multi', name: 'preciso', optional: false, chips: [...kit.NEEDS]},
    {id: 'cr-prazo', mode: 'single', name: 'prazo', optional: true, chips: [...kit.DEADLINES]}
  ]);
  assert.match(form, /data-value="Ainda não sei" data-exclusive/);
  assert.match(form, /<button class="pg-btn pg-btn--primary pg-btn--block" type="submit" disabled>Revisar mensagem<\/button>/);
  assert.match(form, /<div class="pg-error-summary" id="cr-erros" data-error-summary hidden><\/div>/);
  const panel = block(/<section class="pg-review cr-review"/);
  assert.match(panel, /data-handoff-panel hidden/);
  for (const link of panel.match(/<a\b[^>]*data-handoff="(?:whatsapp|email)"[^>]*>/g)) assert.doesNotMatch(link, /\bhref=/, 'handoff links start without href');
  assert.match(panel, /data-handoff="whatsapp" target="_blank" rel="noopener noreferrer"/);
  assert.match(panel, /<p class="pg-review-status" role="status" data-handoff-status><\/p>/);
  assert.match(form, /<a class="cr-nowrap" href="\/privacidade">Como trato seus dados/);
});

test('the page entry wires every component and stays network-free', () => {
  const entry = read('public/assets/pages/criadores.js');
  for (const module of ['./shell.js', './flip.js', './deck.js', './builder.js', './handoff.js', './devices.js', './spring.js', './demos/formats.js', './demos/hooks.js', './criadores-kit.js'])
    assert.ok(entry.includes(`from '${module}'`), module);
  for (const file of ['public/assets/pages/criadores.js', 'public/assets/pages/criadores-kit.js', 'public/assets/pages/demos/formats.js', 'public/assets/pages/demos/hooks.js']) {
    const source = read(file);
    assert.doesNotMatch(source, /requestAnimationFrame|setInterval|localStorage|sessionStorage|\.value\s*\+|innerHTML\s*=\s*[^;]*\.value/, `${file}: no animation-frame loops, storage or unescaped input`);
  }
  assert.match(read('public/assets/pages/criadores.js'), /textContent = `@\$\{handle\}`/, 'the preview writes the @ with textContent');
});
