/* /vagas · unit contracts (SPEC 1.3, 3.C, 4.C, 5.3; copy-vagas.md).
 * Pure message and validation rules, the copy that must stay verbatim, the
 * questions that must never be asked and the no-JS mailto. Route, CSP and the
 * shared HTML rules are covered by tests/pages.test.mjs. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const html = readFileSync(join(root, 'pages/vagas.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
const text = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
await import('../public/assets/profile.js');
const handoff = await import('../public/assets/pages/handoff.js');
const vagas = await import('../public/assets/pages/vagas-message.js');
const {stepLabel} = await import('../public/assets/pages/stepper.js');

const CONSENT = '— Tenho 18 anos ou mais. Li o aviso de privacidade (versão 2026-10) e autorizo guardar estes dados no banco de talentos por até 12 meses para contato sobre oportunidades. Posso pedir a exclusão quando quiser.';
const EXAMPLE = {
  area: 'Edição de vídeo', nivel: 'Já toco projetos sozinho(a)', link1: 'vimeo.com/exemplo', link2: '',
  destaque: 'O corte vertical da série de cerâmica. Fiz edição e legenda.', formato: 'Por projeto (freela)', inicio: 'Em até 30 dias', nome: 'Rafa', maior: true, consentimento: true
};
/* The filled example of copy-vagas.md §5, byte for byte. */
const EXPECTED = [
  'Olá, Smile! Quero entrar no banco de talentos.', 'Nome: Rafa', 'Área: Edição de vídeo', 'Experiência: já toco projetos sozinho(a)',
  'Portfólio: https://vimeo.com/exemplo', 'Para ver primeiro: O corte vertical da série de cerâmica. Fiz edição e legenda.',
  'Disponibilidade: por projeto (freela) · início: em até 30 dias', CONSENT, '(enviado pela página /vagas)'
].join('\n');

test('the copy example becomes the exact message, wa.me and mailto links', () => {
  const result = handoff.buildHandoff(vagas.composeVagas(EXAMPLE));
  assert.equal(result.text, EXPECTED);
  assert.equal(result.subject, 'Banco de talentos · Edição de vídeo · Rafa');
  assert.equal(result.whatsapp, `https://wa.me/5511985568208?text=${encodeURIComponent(EXPECTED)}`);
  assert.equal(result.email, `mailto:smillepls@gmail.com?subject=${encodeURIComponent('Banco de talentos · Edição de vídeo · Rafa')}&body=${encodeURIComponent(EXPECTED.replace(/\n/g, '\r\n'))}`);
  assert.doesNotMatch(result.email.split('&body=')[1].replace(/%0D%0A/g, ''), /%0A|%0D/);
  assert.ok(result.text.length <= handoff.MAX_MESSAGE_LENGTH);
  assert.equal(vagas.CONSENT_LINE, CONSENT);
  assert.ok(vagas.CONSENT_LINE.includes(`versão ${handoff.NOTICE_VERSION}`));
});

test('optional lines appear only with an answer; "Outra" uses its free text', () => {
  const full = vagas.composeVagas({...EXAMPLE, link2: 'https://behance.net/rafa', area: 'Outra', areaOutra: '  Ilustração   3D ', nivel: 'Estudante', formato: 'Meio período', inicio: 'Só quero ficar no radar'});
  const message = handoff.composeMessage(full.lines, full.closing);
  assert.ok(message.includes('\nOutro link: https://behance.net/rafa\n'));
  assert.ok(message.includes('\nÁrea: Ilustração 3D\n'));
  assert.ok(message.includes('\nExperiência: estudante\n'));
  assert.ok(message.includes('\nDisponibilidade: meio período · início: só quero ficar no radar\n'));
  assert.equal(full.subject, 'Banco de talentos · Ilustração 3D · Rafa');
  const bare = vagas.composeVagas({...EXAMPLE, destaque: '   '});
  const short = handoff.composeMessage(bare.lines, bare.closing);
  assert.ok(!short.includes('Outro link') && !short.includes('Para ver primeiro'));
  assert.ok(short.endsWith(`${CONSENT}\n(enviado pela página /vagas)`), 'consent and signature always close the message');
  const long = handoff.buildHandoff(vagas.composeVagas({...EXAMPLE, link1: `https://exemplo.com/${'a'.repeat(1400)}`}));
  assert.ok(long.text.length <= 1500 && long.text.endsWith('(enviado pela página /vagas)') && long.text.includes(CONSENT));
});

test('the message carries only what the form asks (never sensitive data or contact fields)', () => {
  const {lines} = vagas.composeVagas(EXAMPLE);
  const labels = lines.filter(line => typeof line === 'object').map(line => line.label);
  assert.deepEqual(labels, ['Nome', 'Área', 'Experiência', 'Portfólio', 'Outro link', 'Para ver primeiro', 'Disponibilidade']);
});

test('links: https:// is added, other schemes and broken links are refused, duplicates are caught', () => {
  assert.deepEqual(vagas.normalizeLink('vimeo.com/exemplo').url, 'https://vimeo.com/exemplo');
  assert.equal(vagas.normalizeLink('http://site.com.br').url, 'http://site.com.br');
  assert.equal(vagas.normalizeLink('vimeo.com:443/x').status, 'ok');
  for (const scheme of ['ftp://exemplo.com', 'javascript:alert(1)', 'mailto:a@b.com', 'data:text/html,x', 'file:///etc/passwd'])
    assert.equal(vagas.checkLink1({link1: scheme}), 'Use um link que comece com https:// ou http://.', scheme);
  for (const broken of ['meu portfolio', 'exemplo', 'https://', 'https://.com', 'https://user:pass@site.com', 'site..com'])
    assert.equal(vagas.checkLink1({link1: broken}), 'Esse link não abre. Ele começa com https://?', broken);
  assert.equal(vagas.checkLink1({link1: ''}), 'Cole o link do seu portfólio.');
  assert.equal(vagas.checkLink1({link1: '  https://rafa.dev  '}), '');
  assert.equal(vagas.checkLink2({link1: 'vimeo.com/exemplo', link2: 'HTTPS://Vimeo.com/exemplo/'}), 'Esse link é igual ao primeiro.');
  assert.equal(vagas.checkLink2({link1: 'vimeo.com/exemplo', link2: ''}), '');
  assert.equal(vagas.checkLink2({link1: 'vimeo.com/exemplo', link2: 'vimeo.com/outro'}), '');
});

test('every validation message is the copy-deck text', () => {
  assert.equal(vagas.checkArea({area: ''}), 'Escolha uma área para continuar.');
  assert.equal(vagas.checkAreaOther({area: 'Outra', areaOutra: ' '}), 'Escreva a área em poucas palavras.');
  assert.equal(vagas.checkAreaOther({area: 'Outra', areaOutra: 'x'.repeat(41)}), 'Use até 40 caracteres.');
  assert.equal(vagas.checkAreaOther({area: 'Comercial', areaOutra: ''}), '');
  assert.equal(vagas.checkLevel({nivel: ''}), 'Escolha a opção que mais combina com você.');
  assert.equal(vagas.checkHighlight({destaque: 'x'.repeat(281)}), 'Use até 280 caracteres. Agora são 281.');
  assert.equal(vagas.checkHighlight({destaque: 'x'.repeat(280)}), '');
  assert.equal(vagas.checkFormat({formato: ''}), 'Escolha como você pode trabalhar.');
  assert.equal(vagas.checkStart({inicio: ''}), 'Escolha quando você poderia começar.');
  assert.equal(vagas.checkName({nome: ' '}), 'Diga como quer ser chamado(a).');
  assert.equal(vagas.checkName({nome: 'x'.repeat(61)}), 'Use até 60 caracteres.');
  assert.equal(vagas.checkName({nome: 'Rafa'}), '');
  assert.deepEqual(vagas.checkAdult({maior: false}), {message: 'Confirme que você tem 18 anos ou mais.', help: 'Por enquanto, o banco é só para maiores de 18 anos.'});
  assert.equal(vagas.checkConsent({consentimento: false}), 'Para entrar no banco, marque a autorização. Sem ela, eu não posso guardar seus dados.');
  assert.equal(stepLabel(3, 5), 'Etapa 3 de 5');
  assert.equal(vagas.STEP_COUNT, 5);
});

test('the link hint follows the area', () => {
  assert.equal(vagas.linkHint('Edição de vídeo'), 'YouTube não listado, Vimeo ou Drive com acesso liberado.');
  assert.equal(vagas.linkHint('Captação e videomaker'), 'YouTube não listado, Vimeo ou Drive com acesso liberado.');
  assert.equal(vagas.linkHint('Design UI e web'), 'Behance, Dribbble, site ou PDF com acesso liberado.');
  assert.equal(vagas.linkHint('Desenvolvimento front-end'), 'Site no ar ou GitHub.');
  assert.equal(vagas.linkHint('Outra'), 'Site, Drive ou PDF com acesso liberado.');
  assert.equal(vagas.linkHint(''), 'Site, Drive ou PDF com acesso liberado.');
});

test('vagas.html: five steps, one question each, in the SPEC 4.C order', () => {
  const questions = [...html.matchAll(/<span class="vg-step-question">([^<]+)<\/span>/g)].map(m => m[1]);
  assert.deepEqual(questions, ['Em que área você quer entrar no radar?', 'Como você descreveria sua experiência?', 'Onde eu vejo seu trabalho?', 'Como e quando você poderia trabalhar?', 'Revise e escolha por onde enviar']);
  assert.equal((html.match(/<fieldset class="vg-step"/g) || []).length, 5);
  const radios = name => [...html.matchAll(new RegExp(`name="${name}" value="([^"]+)"`, 'g'))].map(m => m[1]);
  assert.deepEqual(radios('area'), [...vagas.AREAS.map(a => a.value), 'Outra']);
  assert.deepEqual(radios('nivel'), Object.keys(vagas.LEVELS));
  assert.deepEqual(radios('formato'), Object.keys(vagas.FORMATS));
  assert.deepEqual(radios('inicio'), Object.keys(vagas.STARTS));
  assert.ok(!radios('formato').some(value => /estágio/i.test(value)), 'no internship format until Q12');
  assert.match(html, /<textarea[^>]*id="vg-destaque"[^>]*maxlength="280"/);
  assert.match(html, /<input[^>]*id="vg-link1"[^>]*type="url"[^>]*inputmode="url"/);
  assert.match(html, /<input[^>]*id="vg-nome"[^>]*autocomplete="nickname"/);
  assert.match(html, /<p class="vg-step-counter" data-step-counter aria-live="polite"/);
  assert.match(html, /<button class="pg-btn pg-btn--primary" type="submit" data-step-next disabled>Continuar<\/button>/);
  assert.match(html, /<button class="pg-btn pg-btn--secondary" type="button" data-step-back hidden>Voltar<\/button>/);
});

test('vagas.html never asks what SPEC 4.C forbids', () => {
  const names = [...new Set([...html.matchAll(/\sname="([^"]+)"/g)].map(m => m[1]).filter(name => !['viewport', 'description', 'theme-color', 'author', 'faq'].includes(name)))];
  assert.deepEqual(names, ['area', 'areaOutra', 'nivel', 'link1', 'link2', 'destaque', 'formato', 'inicio', 'nome', 'maior', 'consentimento']);
  assert.doesNotMatch(html, /type="(?:file|email|tel|date|number)"/);
  assert.doesNotMatch(html, /<select\b/);
  const form = html.slice(html.indexOf('<form'), html.indexOf('</form>'));
  for (const forbidden of [/currículo/i, /\bfoto\b/i, /nascimento/i, /\bidade\b/i, /estado civil/i, /\bCPF\b/, /telefone/i, /pretensão/i, /gênero/i, /\bRG\b/, /endereço/i, /anos de experiência/i])
    assert.doesNotMatch(form.replace(/<[^>]+>/g, ' '), forbidden, `form asks for ${forbidden}`);
  // Both boxes start unchecked; the consent names the retention period and links the notice.
  assert.doesNotMatch(form, /<input[^>]*type="checkbox"[^>]*checked/);
  assert.match(form, new RegExp(`por até ${vagas.RETENTION_MONTHS} meses para me contatar sobre oportunidades de trabalho`));
  assert.match(form, /<a href="\/privacidade"[^>]*>Aviso de privacidade/);
});

test('vagas.html: verbatim copy for the status, the areas and the step 5 texts', () => {
  for (const phrase of [
    'Vagas abertas: nenhuma no momento', 'Banco de talentos: aberto', 'Ainda não tenho vaga aberta. Quando um projeto pedir alguém com o seu talento, é aqui que eu procuro primeiro.',
    'Entrar no banco de talentos ↓', 'Ver como funciona ↓', 'Cinco etapas curtas. Sem currículo e sem anexo. Você revisa a mensagem antes de enviar.',
    'Como é trabalhar comigo.', 'Projetos de criação e desenvolvimento', 'Áreas do banco.', 'Como funciona.', 'Entrar no banco de talentos.', 'Perguntas frequentes.',
    'Escopo, prazo e valor combinados por escrito antes de qualquer trabalho.', 'Seus dados ficam guardados por até 12 meses, e você pode pedir para apagar quando quiser.',
    'Esta é a mensagem que vai sair. Você ainda pode editar no app antes de enviar.', 'Sua mensagem', 'Tenho 18 anos ou mais.',
    'Nada é enviado até você tocar em enviar no seu app.', 'Marque as duas caixas para ver os botões de envio.', 'Abrir no WhatsApp ↗', 'Abrir no e-mail ↗', 'Copiar mensagem',
    'No computador, o link abre o WhatsApp Web ou o aplicativo.', 'Depois de enviar',
    'Não envie foto, documentos, data de nascimento, estado civil ou informações de saúde. Eles não entram na avaliação.',
    'Avalio portfólio e forma de trabalhar. Pessoas de todos os gêneros, raças, orientações e crenças, e pessoas com deficiência, são bem-vindas.'
  ]) assert.ok(text.includes(phrase), phrase);
  const areas = [...html.matchAll(/<span class="vg-area-name" id="area-[a-z0-9-]+-nome">([^<]+)<\/span>/g)].map(m => m[1]);
  assert.deepEqual(areas, vagas.AREAS.map(a => a.value));
  assert.equal((html.match(/<dd>Combinado por projeto\.<\/dd>/g) || []).length, 11);
  assert.equal((html.match(/<span class="pg-tag vg-area-tag">Banco de talentos<\/span>/g) || []).length, 11);
  assert.equal((html.match(/<summary>/g) || []).length, 7, 'FAQ keeps the 7 published questions');
  assert.doesNotMatch(text, /O teste é pago\?|É remoto\?|piloto pago|20 a 30 minutos|2 min/);
  const rest = text.replace(/Vagas abertas: nenhuma no momento|Ainda não tenho vaga aberta|Tem vaga aberta\?/g, '');
  assert.doesNotMatch(rest, /\bvagas?\b|contratando|candidat/i, '"vaga" appears only to say there is none');
});

test('without JS the mailto carries the copy template with %0D%0A', () => {
  const href = handoff.mailtoHref({subject: vagas.NOJS_SUBJECT, body: vagas.NOJS_BODY}, {email: 'smillepls@gmail.com'});
  assert.ok(html.includes(`href="${href.replace(/&/g, '&amp;')}"`), 'pages/vagas.html has the generated mailto');
  assert.equal(decodeURIComponent(href.split('&body=')[1]), ['Olá, Smile! Quero entrar no banco de talentos.', 'Nome:', 'Área:', 'Experiência:', 'Portfólio:', 'Disponibilidade:', CONSENT].join('\r\n'));
  assert.match(html, /<p class="vg-nojs" data-nojs-fallback>Sem JavaScript\? Escreva para <span data-profile-text="email">smillepls@gmail\.com<\/span> com seu nome, área, nível de experiência, link do portfólio e disponibilidade\./);
});
