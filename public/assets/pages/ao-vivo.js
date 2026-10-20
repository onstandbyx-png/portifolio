/* /criadores/ao-vivo · page entry (SPEC 3.B, 4.B; copy-ao-vivo.md).
 * Shell (K1) + service flip cards (K5) + overlay scenes (K17 on K6/K8)
 * + "Da live ao corte" (K15) + thumbnail comparison (K16)
 * + "Montar meu diagnóstico" (K9/K10/K19). Nothing is sent from the page:
 * the form builds a message the visitor reviews and opens by tapping a real
 * wa.me or mailto: link. Contact data comes only from PORTFOLIO_PROFILE. */
import {motion} from './shell.js';
import {mountFlipGroup} from './flip.js';
import {mountBuilder, createValidator} from './builder.js';
import {mailtoHref, mountReview, profileDestinations} from './handoff.js';
import {OTHER_NICHE, PAGE, composeDiagnostico, fieldErrors, summaryLines, NOJS_SUBJECT, NOJS_BODY} from './ao-vivo-form.js';
import {mountOverlay} from './demos/overlay.js';
import {mountLiveCut} from './demos/live-cut.js';
import {mountCompare} from './compare.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function mountDiagnostico() {
  const form = $('#diagnostico-form');
  if (!form) return null;
  const otherField = $('#av-nicho-outro-campo'), otherInput = $('#av-nicho-outro');
  const builder = mountBuilder(form, {
    summary: $('#av-resumo'),
    describe: values => {
      const lines = summaryLines(values);
      return {lines, count: lines.length};
    }
  });
  const values = () => ({...builder.values(), nichoOutro: otherInput && !otherInput.disabled ? otherInput.value : ''});
  const email = () => profileDestinations().email || '';
  const pick = key => (v, field) => {
    const {errors, help} = fieldErrors(v, {email: email()});
    if (key === 'maior' && errors.maior) return {message: errors.maior, help};
    return errors[key];
  };
  const validator = createValidator(form, [
    {id: 'av-plataformas', check: pick('plataformas')},
    {id: 'av-frequencia', check: pick('frequencia')},
    {id: 'av-duracao', check: pick('duracao')},
    {id: 'av-nicho', check: pick('nicho')},
    {id: 'av-nicho-outro', check: pick('nichoOutro')},
    {id: 'av-objetivo', check: pick('objetivo')},
    {id: 'av-canal', check: pick('canal')},
    {id: 'av-maior', check: pick('maior')}
  ], {summary: $('#av-erros'), values});

  // "Outro" reveals "Qual?"; the field is disabled (out of the answers) otherwise.
  const syncOther = () => {
    const on = builder.get('nicho') === OTHER_NICHE;
    if (!otherField || !otherInput) return;
    otherField.hidden = !on;
    otherInput.disabled = !on;
    if (!on) validator.validateField('av-nicho-outro');
  };
  $('#av-nicho')?.addEventListener('builder:change', syncOther);
  syncOther();

  return mountReview({
    form, panel: $('#av-revisao'), validator, page: PAGE, motion,
    compose: () => composeDiagnostico(values())
  });
}

/* Mailto models (no-JS fallback and the final strip): rebuilt from the profile. */
function syncMailtoModels() {
  const destinations = profileDestinations();
  if (!destinations.email) return;
  const href = mailtoHref({subject: NOJS_SUBJECT, body: NOJS_BODY}, destinations);
  $$('a[data-mailto-model="diagnostico"]').forEach(link => { link.href = href; });
}

function init() {
  mountFlipGroup($('#servicos') || document);
  mountOverlay($('#demo-overlay'));
  mountLiveCut($('#demo-corte'));
  mountCompare($('#demo-thumb [data-compare]'));
  syncMailtoModels();
  mountDiagnostico();
  document.documentElement.dataset.pageReady = 'ao-vivo';
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
else init();
