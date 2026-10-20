/* /criadores/ao-vivo · unit contracts (SPEC 3.B, 4.B, 5.2, 8.2; copy-ao-vivo.md).
 * The shared rules (routes, CSP, shell, network-free modules) live in
 * tests/pages.test.mjs; this file checks the page's own copy, legal guards,
 * form message and demo helpers. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const raw = read('pages/criadores-ao-vivo.html');
const html = raw.replace(/<!--[\s\S]*?-->/g, '');
const decode = text => text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const visibleText = source => decode(source.replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const text = visibleText(html);
const between = (start, end) => html.slice(html.indexOf(start), html.indexOf(end, html.indexOf(start)));

await import('../public/assets/profile.js');
const form = await import('../public/assets/pages/ao-vivo-form.js');
const handoff = await import('../public/assets/pages/handoff.js');
const cut = await import('../public/assets/pages/demos/live-cut.js');
const overlay = await import('../public/assets/pages/demos/overlay.js');
const compare = await import('../public/assets/pages/compare.js');

const ORIGIN = 'https://portifolio-github-production.up.railway.app';
const CONSENT = '— Tenho 18 anos ou mais e li o aviso de privacidade (versão 2026-10).';

test('metadata and canonical come from copy-ao-vivo.md §0', () => {
  assert.ok(html.includes('<title>Para quem transmite: identidade, cortes e patrocínio · Smile N</title>'));
  assert.ok(html.includes('<meta name="description" content="Identidade da live, cortes do VOD, roteiro de patrocínio e de venda ao vivo para quem transmite no YouTube, Twitch, Kick, TikTok LIVE, Instagram Live ou Kwai. Você revisa a mensagem antes de enviar.">'));
  assert.ok(html.includes('<meta property="og:title" content="A live acaba. O que ela rende, não.">'));
  assert.ok(html.includes('<meta property="og:description" content="Identidade da transmissão, cortes da semana e proposta para marcas.">'));
  assert.ok(html.includes(`<link rel="canonical" href="${ORIGIN}/criadores/ao-vivo">`));
  assert.ok(html.includes(`<meta property="og:url" content="${ORIGIN}/criadores/ao-vivo">`));
  assert.ok(html.includes('<script type="module" src="/assets/pages/ao-vivo.js"></script>'));
});

test('hero: one h1, one CTA, track switch and the fictional-client label', () => {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g);
  assert.equal(h1.length, 1);
  assert.equal(visibleText(h1[0]), 'A live acaba. O que ela rende, não.');
  assert.match(h1[0], /<em>O que ela rende, não\.<\/em>/);
  const hero = between('data-hero', '</section>');
  assert.equal((hero.match(/class="pg-btn pg-btn--primary[^"]*"/g) || []).length, 1, 'a single primary offer in the hero');
  assert.match(hero, /href="#diagnostico">Montar meu diagnóstico <span aria-hidden="true">↓<\/span><\/a>/);
  assert.match(hero, /href="#exemplos">Ver exemplos <span aria-hidden="true">↓<\/span><\/a>/);
  assert.match(hero, /<nav class="pg-track[^"]*" aria-label="Escolha a página do seu formato"><a href="\/criadores">Redes sociais<\/a><a href="\/criadores\/ao-vivo" aria-current="page">Vídeo e live<\/a><\/nav>/);
  assert.ok(visibleText(hero).includes('Exemplo ilustrativo · Ateliê Exemplo (cliente fictício)'));
  assert.ok(visibleText(hero).includes('Espaço da marca parceira'));
  assert.doesNotMatch(hero, /data-publi/, 'the hero scene shows no sponsored segment');
  assert.match(hero, /role="img" aria-label="Exemplo de overlay de live do Ateliê Exemplo, cena Ao vivo, com espaço reservado para marca parceira\."/);
  assert.match(html, /class="pg-btn pg-btn--primary pg-header-cta" href="#diagnostico" data-header-cta>Montar meu diagnóstico <span aria-hidden="true">↓<\/span>/);
  assert.match(html, /<nav class="pg-nav"[^>]*>[\s\S]*?<a href="\/criadores\/ao-vivo" aria-current="page">Ao vivo<\/a><\/nav>/);
});

test('no embeds, media autoplay, logos or other brands (SPEC 3.B AV1/AV4, 6)', () => {
  assert.doesNotMatch(html, /<(?:iframe|embed|object|audio|video)\b/i);
  assert.doesNotMatch(html, /youtube\.com\/embed|player\.twitch|autoplay/i);
  assert.doesNotMatch(html, /<img\b/i, 'demos are drawn in HTML/CSS/SVG');
  for (const name of ['Nerd or Die', 'OWN3D', 'StreamElements', 'Streamlabs', 'OBS']) assert.ok(!text.includes(name), name);
  assert.ok((text.match(/Exemplo ilustrativo · Ateliê Exemplo \(cliente fictício\)/g) || []).length >= 4, 'every demo carries the same label');
});

test('AV6: the "não faço" list, the CONAR block and only negative partnership wording', () => {
  const donts = between('class="av-donts"', '</ul>');
  assert.deepEqual([...donts.matchAll(/<li>[\s\S]*?<span>([^<]+)<\/span><\/li>/g)].map(m => m[1]), [
    'Não sou agência de LIVE nem parceiro oficial de nenhuma plataforma.',
    'Não peço senha, chave de transmissão, vínculo de conta nem porcentagem de presentes ou de ganhos.',
    'Não prometo seguidores, monetização nem patrocínio.',
    'Não faço publi de apostas ou cassino.',
    'Não vendo compilado nem repost de live alheia.',
    'Não atendo menores de 18 pelo formulário.'
  ]);
  assert.ok(text.includes('Patrocínio identificado do começo ao fim da live.'));
  assert.ok(text.includes('o #publi na tela durante todo o segmento e o aviso falado repetido'));
  assert.ok(text.includes('Em live de venda, preço, condições e troca são ditos com clareza.'));
  assert.match(html, /href="https:\/\/conar\.wpenginepowered\.com\/wp-content\/uploads\/2026\/05\/260525_GUIA_INFLUENCIADORES_CONAR_v6\.pdf" target="_blank" rel="noopener noreferrer">Ler o guia do CONAR/);
  assert.ok(text.includes('Não sou parceiro oficial, agência credenciada nem representante de YouTube, Twitch, Kick, TikTok, Instagram, Meta ou Kwai.'));
  // Affirmative forms are banned; the negative form is mandatory (SPEC 3.B AV6).
  for (const match of text.matchAll(/agência de LIVE|parceiro oficial|agência credenciada/gi)) {
    const before = text.slice(Math.max(0, match.index - 40), match.index);
    assert.match(before, /(?:Não sou|não sou|nem|Não)\s*(?:\S+\s*){0,3}$/, `"${match[0]}" only in a negative sentence: …${before}`);
  }
  for (const banned of [/Backstage/i, /vincular sua conta/i, /% dos diamantes/i, /aprovado pelo CONAR/i, /Creator Network/i, /\bcertificad[oa]\b/i])
    assert.doesNotMatch(text, banned);
  assert.doesNotMatch(raw, /#banco-de-criadores|id="banco-de-criadores"/, 'creator pool stays off (Q1)');
});

test('AV4: overlay scenes, the fixed #publi tag and the empty partner space', () => {
  const demo = between('id="demo-overlay"', 'id="demo-corte"');
  assert.deepEqual([...demo.matchAll(/data-scene-go="(\d)">([^<]+)</g)].map(m => [Number(m[1]), m[2]]), overlay.SCENES.map((name, i) => [i, name]));
  assert.match(demo, /role="group" aria-label="Cena"/);
  assert.match(demo, /role="group" aria-label="Formato da tela"/);
  assert.equal((demo.match(/data-deck-card/g) || []).length, 4);
  const live = demo.slice(demo.indexOf('aria-label="2 de 4: Ao vivo"'), demo.indexOf('aria-label="3 de 4: Intervalo"'));
  assert.match(live, /<p class="av-scene-publi" data-publi>#publi · Publicidade<\/p>/);
  assert.ok(visibleText(live).includes('Espaço da marca parceira'));
  assert.ok(visibleText(demo).includes('Começa em instantes') && visibleText(demo).includes('Separando o barro para a próxima peça') && visibleText(demo).includes('Próxima live: quinta'));
  assert.ok(visibleText(demo).includes(overlay.STATUS.scene[0]), 'initial status');
  assert.equal(overlay.STATUS.scene[1], 'Ao vivo: o rótulo de publicidade fica na tela durante todo o segmento patrocinado.');
  assert.equal(overlay.STATUS.ratio['9:16'], '9:16: a mesma cena, recomposta para o celular.');
});

test('AV4: "Da live ao corte" marks, storyboard and statuses (copy §4.2)', () => {
  assert.deepEqual(cut.MARKS.map(m => [m.time, m.label, m.title, m.caption]), [
    ['00:42', 'A peça rachou', 'Rachou ao vivo. E agora?', '"Calma, dá para salvar. Olha só."'],
    ['01:15', 'Pergunta do chat', 'Qual barro usar para começar?', '"Essa pergunta apareceu três vezes no chat."'],
    ['02:30', 'Forno aberto', 'O momento de abrir o forno', '"Nunca sei o que vou encontrar."']
  ]);
  for (const mark of cut.MARKS) assert.ok(html.includes(`<b>${mark.time}</b> · ${mark.label}`), mark.time);
  assert.deepEqual(cut.storyboard().map(s => `${s.tag}: ${s.headline}`), ['01 · GANCHO: Rachou ao vivo. E agora?', '02 · CONTEXTO: O trecho da live, com legenda.', '03 · CONVITE: Live completa toda quinta.']);
  assert.equal(cut.STATUS.mark('00:42'), 'Marcação 00:42: a prévia virou um corte 9:16.');
  assert.equal(cut.STATUS.end, 'Fim: três cenas em dez segundos.');
  assert.equal(cut.STATUS.paused(2), 'Pausado na cena 2 de 3.');
  assert.equal(cut.STATUS.step(1, 'Rachou ao vivo. E agora?'), 'Cena 1 de 3: Rachou ao vivo. E agora?');
  assert.equal(cut.STORYBOARD_MS, 10000);
  assert.deepEqual([0, 3499, 3500, 6999, 7000, 10000].map(cut.sceneAt), [0, 0, 1, 1, 2, 2]);
  assert.deepEqual([0, 3500, 7000, 10000].map(cut.nextStep), [3500, 7000, 0, 0]);
  assert.deepEqual([0, 999, 1000, 9999, 10000, 12000].map(cut.clockText), ['00:00', '00:00', '00:01', '00:09', '00:10', '00:10']);
  assert.match(html, /aria-label="Linha do tempo de uma live de 3 horas"/);
  assert.match(html, /data-cut-play aria-label="Assistir"/);
  assert.match(html, /data-cut-replay aria-label="Reiniciar"/);
  assert.match(html, /role="group" aria-label="Formato do vídeo"/);
  assert.ok(text.includes('Corte bom tem gancho, contexto e legenda. É isso que separa um corte de um repost. Demonstração sem som.'));
});

test('AV4: thumbnail comparison is a native range with aria-valuetext and no CTR claim', () => {
  assert.match(html, /<label for="av-thumb-range">Comparar thumbnails<\/label>\s*<input class="pg-compare-range" id="av-thumb-range" type="range" min="0" max="100" step="1" value="50" data-compare-range aria-valuetext="Mostrando 50% da versão nova">/);
  assert.match(html, /role="img" aria-label="Thumbnail genérica com texto pequeno e sem foco\."/);
  assert.match(html, /role="img" aria-label="Thumbnail com rosto, três palavras grandes e contraste alto\."/);
  assert.ok(text.includes('Para medir no seu canal, use o teste A/B de títulos e miniaturas do YouTube Studio. Aqui é só uma demonstração de acabamento.'));
  assert.match(html, /href="https:\/\/support\.google\.com\/youtube\/answer\/16391400" target="_blank" rel="noopener noreferrer">Como funciona o teste A\/B do YouTube/);
  assert.doesNotMatch(text, /CTR|\+\s?\d/);
  assert.equal(compare.compareValueText(64.4), 'Mostrando 64% da versão nova');
  assert.equal(compare.keyStep('ArrowRight', 50), 60);
  assert.equal(compare.keyStep('ArrowLeft', 5), 0);
  assert.equal(compare.keyStep('End', 12), 100);
  assert.equal(compare.keyStep('Home', 80), 0);
  assert.equal(compare.keyStep('PageUp', 90), 100);
  assert.equal(compare.keyStep('a', 50), null);
  assert.equal(compare.COMPARE.glide, 500);
  assert.equal(compare.COMPARE.easing, 'cubic-bezier(.25,.1,.25,1)');
});

test('AV3/AV5/AV8/AV9: services, steps, FAQ and the final strip', () => {
  for (const [title, line] of [['Identidade da live', 'Sua transmissão com cara de canal.'], ['Cortes e VOD', 'Horas de live viram cortes da semana.'], ['Patrocínio e venda ao vivo', 'A marca entra na live do jeito certo.']]) {
    assert.ok(text.includes(title) && text.includes(line), title);
  }
  assert.equal((html.match(/data-flip-open aria-pressed="false">Ver o que vem<\/button>/g) || []).length, 3);
  assert.equal((html.match(/data-flip-close>Voltar<\/button>/g) || []).length, 3);
  assert.equal((html.match(/data-flip-reduced="stack"/g) || []).length, 3, 'reduced motion stacks both faces');
  assert.doesNotMatch(text, /PNG, WebM e MP4/, 'Q13 line stays out');
  for (const step of ['Diagnóstico em cinco toques', 'Proposta por escrito', 'Produção no ritmo da sua agenda', 'Entrega com instruções']) assert.ok(text.includes(step), step);
  const faq = between('class="pg-accordion-list"', 'id="comece"');
  assert.equal((faq.match(/<details class="pg-accordion" name="faq">/g) || []).length, 11);
  const external = [...faq.matchAll(/<a href="(https:[^"]+)"([^>]*)>([\s\S]*?)<\/a>/g)];
  assert.equal(external.length, 4);
  for (const [, href, attrs, label] of external) {
    assert.match(attrs, /target="_blank"/, href);
    assert.match(attrs, /rel="[^"]*noopener[^"]*"/, href);
    assert.match(label, /↗/, href);
  }
  assert.ok(visibleText(faq).includes('Links conferidos em outubro de 2026.'));
  assert.ok(visibleText(faq).includes('Hoje meu foco é o seu material: identidade, cortes e proposta.'), 'Q1 off variant');
  assert.match(faq, /<a href="\/criadores">Ver a página para redes sociais <span aria-hidden="true">→<\/span><\/a>/);
  const final = between('id="comece"', '</section>');
  assert.match(final, /href="#diagnostico">Montar meu diagnóstico <span aria-hidden="true">↑<\/span>/);
  assert.match(final, /Posta no feed\? <a class="av-link" href="\/criadores">Ver a página para redes sociais/);
  assert.ok(html.includes('Sem vínculo com YouTube, Twitch, Kick, TikTok, Instagram, Meta ou Kwai. As marcas citadas pertencem aos seus titulares.'));
});

test('form markup follows SPEC 4.0/4.B: novalidate, disabled submit, 18+ unchecked, no forbidden questions', () => {
  const markup = between('<form class="av-form"', '</form>');
  assert.match(markup, /<form class="av-form" id="diagnostico-form" novalidate/);
  assert.match(markup, /<button class="pg-btn pg-btn--primary pg-btn--block av-submit" type="submit" disabled>Revisar mensagem<\/button>/);
  assert.match(markup, /<input type="checkbox" id="av-maior" name="maior">/);
  assert.doesNotMatch(markup, /checked/);
  for (const [id, legend] of [['av-plataformas', 'Onde você transmite?'], ['av-frequencia', 'Com que frequência?'], ['av-duracao', 'Quanto dura uma live, em média?'], ['av-nicho', 'Qual o seu nicho?'], ['av-objetivo', 'O que você quer resolver primeiro?']])
    assert.match(markup, new RegExp(`id="${id}"[^>]*>\\s*<legend>${legend.replace('?', '\\?')}</legend>`), id);
  assert.deepEqual([...between('id="av-plataformas"', '</fieldset>').matchAll(/data-value="([^"]+)"/g)].map(m => m[1]), form.PLATAFORMAS);
  assert.deepEqual([...between('id="av-frequencia"', '</fieldset>').matchAll(/data-value="([^"]+)"/g)].map(m => m[1]), Object.keys(form.FREQUENCIA));
  assert.deepEqual([...between('id="av-duracao"', '</fieldset>').matchAll(/data-value="([^"]+)"/g)].map(m => m[1]), Object.keys(form.DURACAO));
  assert.deepEqual([...between('id="av-nicho"', '</fieldset>').matchAll(/data-value="([^"]+)"/g)].map(m => m[1]), form.NICHOS);
  assert.deepEqual([...between('id="av-objetivo"', '</fieldset>').matchAll(/data-value="([^"]+)"/g)].map(m => m[1]), Object.keys(form.OBJETIVO));
  assert.match(markup, /<label class="pg-label" for="av-canal">Link do canal \(opcional\)<\/label>/);
  assert.match(markup, /id="av-canal" name="canal" type="url" inputmode="url"/);
  assert.equal((visibleText(markup).match(/\(opcional\)/g) || []).length, 1, 'at most two optional fields');
  assert.doesNotMatch(markup, /seguidores|espectadores|receita|senha|chave de transmissão|telefone|CPF/i, 'never asks forbidden data');
  assert.doesNotMatch(markup, /<input[^>]+type="(?:email|tel|password|file)"/);
  assert.doesNotMatch(markup, /<textarea|<select/);
  assert.ok(visibleText(markup).includes('Você revisa a mensagem antes de enviar. Uso suas respostas só para preparar a proposta que você pediu. Nada sai daqui até você tocar em enviar no WhatsApp ou no e-mail. Como trato seus dados →'));
  assert.match(markup, /<a href="\/privacidade">Como trato seus dados/);
  // Review panel contract (privacidade.html template): links start without href.
  assert.match(markup, /<a class="pg-btn pg-btn--primary" data-handoff="whatsapp" target="_blank" rel="noopener noreferrer">Abrir no WhatsApp/);
  assert.match(markup, /<a class="pg-btn pg-btn--secondary" data-handoff="email">Prefiro e-mail/);
  assert.doesNotMatch(markup, /data-handoff="(?:whatsapp|email)"[^>]*href=/);
  assert.ok(visibleText(markup).includes('Seu diagnóstico está pronto.'));
  assert.ok(visibleText(markup).includes('Eu respondo com duas ou três perguntas e, se fizer sentido, uma proposta por escrito.'));
});

test('no-JS fallback: visible mailto with the §8.5 subject and body (%0D%0A)', () => {
  const expected = handoff.mailtoHref({subject: form.NOJS_SUBJECT, body: form.NOJS_BODY}, {email: 'smillepls@gmail.com'});
  const links = [...html.matchAll(/data-mailto-model="diagnostico" href="([^"]+)"/g)].map(m => decode(m[1]));
  const linksAfter = [...html.matchAll(/href="([^"]+)" data-mailto-model="diagnostico"/g)].map(m => decode(m[1]));
  const all = [...links, ...linksAfter, ...[...html.matchAll(/<a class="av-link" data-mailto-model="diagnostico" href="([^"]+)"/g)].map(m => decode(m[1]))];
  assert.ok(all.length >= 2, 'fallback and final strip');
  for (const href of all) assert.equal(href, expected);
  assert.equal(decodeURIComponent(expected.split('body=')[1]), [
    'Oi, Smile! Vim pela página de criadores ao vivo.', 'Transmito em:', 'Frequência:', 'Duração média:', 'Nicho:', 'Quero resolver primeiro:', CONSENT
  ].join('\r\n'));
  assert.ok(expected.includes('subject=Diagn%C3%B3stico%20de%20live&body='));
  assert.ok(text.includes('Sem JavaScript? Escreva para smillepls@gmail.com contando onde você transmite, com que frequência, quanto dura a live, seu nicho e o que quer resolver primeiro.'));
  assert.match(html, /data-nojs-fallback/);
});

test('message: the filled example of copy §8.4 is reproduced exactly', () => {
  const values = {plataformas: ['Twitch', 'YouTube'], frequencia: '2 a 3 vezes por semana', duracao: 'De 3 a 6 h', nicho: 'Conversa (Just Chatting)', objetivo: 'Crescer fora da live', canal: 'https://www.twitch.tv/canal.exemplo', maior: true};
  const result = handoff.buildHandoff(form.composeDiagnostico(values, ''));
  const expected = [
    'Oi, Smile! Vim pela página de criadores ao vivo.',
    'Transmito em: Twitch e YouTube',
    'Frequência: 2 a 3 vezes por semana · Duração média: de 3 a 6 h',
    'Nicho: Conversa (Just Chatting)',
    'Quero resolver primeiro: crescer fora da live (cortes e Shorts)',
    'Canal: https://www.twitch.tv/canal.exemplo',
    CONSENT
  ].join('\n');
  assert.equal(result.text, expected);
  assert.equal(result.whatsapp, `https://wa.me/5511985568208?text=${encodeURIComponent(expected)}`);
  assert.equal(result.email, `mailto:smillepls@gmail.com?subject=${encodeURIComponent('Diagnóstico de live · cortes')}&body=${encodeURIComponent(expected.replace(/\n/g, '\r\n'))}`);
  assert.doesNotMatch(result.email.split('&body=')[1].replace(/%0D%0A/g, ''), /%0A|%0D/);
  assert.ok(result.text.length <= handoff.MAX_MESSAGE_LENGTH);
});

test('message: optional lines drop out, ?ref= adds the origin only from the allowlist, subjects map', () => {
  const base = {plataformas: ['YouTube', 'Kick', 'Venda ao vivo (TikTok Shop, Shopee ou outra)'], frequencia: 'Sem agenda fixa', duracao: 'Até 1 h', nicho: 'Outro', nichoOutro: '  Cerâmica   ao vivo ', objetivo: 'Vender ao vivo', canal: '', maior: true};
  const plain = handoff.buildHandoff(form.composeDiagnostico(base, '?ref=spam'));
  assert.equal(plain.text, [
    'Oi, Smile! Vim pela página de criadores ao vivo.',
    'Transmito em: YouTube, Kick e Venda ao vivo (TikTok Shop, Shopee ou outra)',
    'Frequência: sem agenda fixa · Duração média: até 1 h',
    'Nicho: Cerâmica ao vivo',
    'Quero resolver primeiro: vender ao vivo (roteiro e cenário)',
    CONSENT
  ].join('\n'));
  assert.equal(plain.subject, 'Diagnóstico de live · venda ao vivo');
  const dm = handoff.buildHandoff(form.composeDiagnostico({...base, canal: 'kick.com/atelie.exemplo'}, '?ref=dm'));
  assert.ok(dm.text.includes('\nCanal: https://kick.com/atelie.exemplo\nOrigem: link que você me mandou\n— Tenho'));
  const subjects = Object.fromEntries(Object.keys(form.OBJETIVO).map(key => [key, form.composeDiagnostico({...base, objetivo: key}, '').subject]));
  assert.deepEqual(subjects, {
    'Live com cara profissional': 'Diagnóstico de live · identidade',
    'Crescer fora da live': 'Diagnóstico de live · cortes',
    'Fechar patrocínio': 'Diagnóstico de live · patrocínio',
    'Vender ao vivo': 'Diagnóstico de live · venda ao vivo'
  });
});

test('validation: pt-BR errors exactly as copy §8.2, URL rule and the guardian path', () => {
  const empty = form.fieldErrors({}, {email: 'smillepls@gmail.com'});
  assert.deepEqual(empty.errors, {
    plataformas: 'Escolha pelo menos uma plataforma.',
    frequencia: 'Escolha com que frequência você transmite.',
    duracao: 'Escolha a duração média das suas lives.',
    nicho: 'Escolha o seu nicho.',
    nichoOutro: '',
    objetivo: 'Escolha o que você quer resolver primeiro.',
    canal: '',
    maior: 'Confirme que você tem 18 anos ou mais.'
  });
  assert.equal(empty.help, 'Por enquanto atendo só maiores de 18 anos. Live com menor de idade tem regras próprias. Se você é responsável por um criador menor, escreva para smillepls@gmail.com e eu converso com você.');
  assert.equal(form.fieldErrors({nicho: 'Outro', nichoOutro: '   '}).errors.nichoOutro, 'Escreva o seu nicho em poucas palavras.');
  assert.equal(form.fieldErrors({nicho: 'Outro', nichoOutro: 'x'.repeat(41)}).errors.nichoOutro, 'Use até 40 caracteres.');
  assert.equal(form.fieldErrors({nicho: 'Outro', nichoOutro: 'x'.repeat(40)}).errors.nichoOutro, '');
  assert.equal(form.fieldErrors({nicho: 'Games', nichoOutro: ''}).errors.nichoOutro, '');
  for (const bad of ['ab cd', 'javascript:alert(1)', 'ftp://canal.exemplo', 'canal', 'https://', 'https://user:pass@canal.exemplo', 'http://.exemplo'])
    assert.equal(form.fieldErrors({canal: bad}).errors.canal, 'Esse link não abre. Ele começa com https://?', bad);
  assert.deepEqual(form.normalizeChannelUrl('www.twitch.tv/canal.exemplo'), {ok: true, url: 'https://www.twitch.tv/canal.exemplo'});
  assert.deepEqual(form.normalizeChannelUrl('http://youtube.com/@atelie'), {ok: true, url: 'http://youtube.com/@atelie'});
  assert.deepEqual(form.normalizeChannelUrl(''), {ok: true, url: ''});
  assert.deepEqual(form.summaryLines({plataformas: ['Twitch', 'YouTube'], frequencia: '2 a 3 vezes por semana', duracao: 'De 3 a 6 h', nicho: 'Outro', nichoOutro: 'Cerâmica', objetivo: 'Fechar patrocínio'}),
    ['Transmite em: Twitch e YouTube', '2 a 3 vezes por semana · De 3 a 6 h', 'Nicho: Cerâmica', 'Primeiro: Fechar patrocínio']);
  assert.deepEqual(form.summaryLines({}), []);
});

test('page modules keep contact data in profile.js only', () => {
  for (const path of ['public/assets/pages/ao-vivo.js', 'public/assets/pages/ao-vivo-form.js', 'public/assets/pages/demos/live-cut.js', 'public/assets/pages/demos/overlay.js', 'public/assets/pages/compare.js']) {
    const source = read(path);
    assert.doesNotMatch(source, /5511985568208|smillepls@gmail\.com/, path);
    assert.doesNotMatch(source, /setInterval\(/, `${path} never polls`);
  }
  const liveCut = read('public/assets/pages/demos/live-cut.js');
  assert.match(liveCut, /IntersectionObserver/, 'playback depends on visibility');
  assert.match(liveCut, /visibilitychange/);
  assert.doesNotMatch(liveCut, /\.play\(\)|new Audio|createElement\(['"](?:audio|video)/);
});
