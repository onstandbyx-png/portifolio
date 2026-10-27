import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {existsSync, readdirSync} from 'node:fs';
import {mkdir, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {
  VIEWPORTS, openPage, gotoRoute, routeChecks, cleanChecks, shellChecks, contrastAudit, focusRingAudit,
  targetAudit, idleRafCheck, reducedMotionChecks, pausedChecks, noJsChecks, screenshot, settle,
  layoutSweep, cumulativeLayoutShift, overflowState, fitsWidth
} from './pages/harness.mjs';
import {componentChecks, componentReducedChecks, withHeaderCta} from './pages/components.mjs';

/* Parallel pages browser suite (SPEC 8.3). Same harness pattern as
 * tests/browser-conversion.mjs: reuse BASE_URL/QA_URL or serve this checkout.
 * Each route is a separate module, tests/pages/route-<slug>.mjs, discovered here,
 * so every page adds its own file without editing this runner.
 * PAGES_ONLY=privacidade,vagas limits the run to some slugs. */
const require = createRequire(process.env.QA_PACKAGE || import.meta.url);
let chromium;
try { ({chromium} = require('playwright')); }
catch { ({chromium} = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
const port = process.env.PORT || '4250';
const base = (process.env.BASE_URL || process.env.QA_URL || `http://127.0.0.1:${port}`).replace(/\/$/, '');
const output = process.env.QA_OUTPUT || 'qa/pages';
await mkdir(output, {recursive: true});
const server = process.env.BASE_URL || process.env.QA_URL ? null : spawn(process.execPath, ['server.mjs'], {env: {...process.env, PORT: port}, stdio: 'inherit'});
const report = {base, environment: {browser: 'Chromium', note: 'Functional, accessibility and layout audit; not a real-device performance measurement.'}, results: []};
const only = (process.env.PAGES_ONLY || '').split(',').map(item => item.trim()).filter(Boolean);
let browser;

async function step(env, options, body) {
  const t = await openPage(env, options);
  const tag = `[pages ${t.slug} ${t.width}×${t.height}${options.label ? ` ${options.label}` : ''}]`;
  try { await body(t); }
  catch (error) {
    t.row.failure = String(error?.message || error);
    console.error(`${tag} ${t.row.failure}`);
    await t.page.screenshot({path: `${output}/failure-${t.slug}-${t.width}${options.label ? `-${options.label}` : ''}.png`, animations: 'disabled'}).catch(() => {});
  } finally {
    console.log(`${tag} ${t.row.checks.filter(item => item.pass).length} checks passed${t.row.failure ? ' · failed' : ''}`);
    await t.context.close();
  }
}

try {
  let healthy = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch(`${base}/health`)).ok) { healthy = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  assert(healthy, `Preview did not become healthy: ${base}`);
  // The home is only compared by its CSP header; the browser never visits it.
  const homeCsp = (await fetch(`${base}/`)).headers.get('content-security-policy');
  assert(homeCsp, 'Home CSP header');
  const executablePath = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({headless: true, executablePath, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
  const env = {browser, base, output, report, homeCsp};

  const directory = new URL('./pages/', import.meta.url);
  const modules = [];
  for (const name of readdirSync(directory).filter(file => /^route-[a-z0-9-]+\.mjs$/.test(file)).sort()) {
    const mod = await import(new URL(name, directory));
    assert(mod.route && mod.slug && typeof mod.checks === 'function', `${name} must export route, slug and checks()`);
    if (!only.length || only.includes(mod.slug)) modules.push(mod);
  }
  assert(modules.length || only.includes('components'), 'No route module to run');

  for (const mod of modules) {
    for (const [width, height] of VIEWPORTS) {
      await step(env, {route: mod.route, slug: mod.slug, width, height}, async t => {
        const response = await gotoRoute(t);
        await routeChecks(t, response);
        await shellChecks(t);
        await settle(t.page);
        const contrast = await contrastAudit(t.page);
        t.check('Visible text reaches 4.5:1 (3:1 for large text)', contrast.failures.length === 0 && contrast.checked > 10, contrast);
        const targets = await targetAudit(t.page);
        t.check('Interactive targets are at least 44 × 44 px', targets.failures.length === 0, targets.failures);
        const rings = await focusRingAudit(t.page);
        t.check('Focus ring is visible with 3:1 contrast', rings.failures.length === 0 && rings.checked > 5, rings.failures);
        await t.page.evaluate(() => { document.activeElement?.blur?.(); window.scrollTo({top: 0, behavior: 'instant'}); });
        await screenshot(t);
        await idleRafCheck(t, 'after load');
        await mod.checks(t);
        await idleRafCheck(t, 'after the page interactions');
        await cleanChecks(t);
      });
      if (width !== 320) {
        await step(env, {route: mod.route, slug: mod.slug, width, height, reducedMotion: 'reduce', label: 'reduced'}, async t => {
          await gotoRoute(t);
          await reducedMotionChecks(t);
          if (typeof mod.reduced === 'function') await mod.reduced(t);
          await cleanChecks(t);
        });
        await step(env, {route: mod.route, slug: mod.slug, width, height, label: 'paused'}, async t => {
          await gotoRoute(t);
          await pausedChecks(t);
          if (typeof mod.paused === 'function') await mod.paused(t);
          await cleanChecks(t);
        });
      }
    }
    // Between the main viewports: a desktop resize sweep, then CLS on fresh loads.
    await step(env, {route: mod.route, slug: mod.slug, width: 1024, height: 768, label: 'sweep'}, async t => {
      await gotoRoute(t);
      await settle(t.page).catch(() => {});
      const small = await cumulativeLayoutShift(t.page);
      t.check('Layout shift on load stays under 0.05 at 1024 × 768', small.total < 0.05, small);
      await t.page.setViewportSize({width: 1440, height: 900});
      await gotoRoute(t);
      await settle(t.page).catch(() => {});
      const large = await cumulativeLayoutShift(t.page);
      t.check('Layout shift on load stays under 0.05 at 1440 × 900', large.total < 0.05, large);
      await layoutSweep(t);
      await gotoRoute(t);
      await cleanChecks(t);
    });
    // Phones in landscape and tablets (mobile emulation: the layout viewport would grow with overflow).
    for (const [width, height] of [[844, 390], [768, 1024]]) {
      await step(env, {route: mod.route, slug: mod.slug, width, height, mobile: true, label: 'mobile'}, async t => {
        await gotoRoute(t);
        const overflow = await overflowState(t.page, width);
        t.check(`No horizontal scroll on a ${width} × ${height} touch screen`, fitsWidth(overflow), overflow);
        await cleanChecks(t);
      });
    }
    await step(env, {route: mod.route, slug: mod.slug, width: 390, height: 844, javaScriptEnabled: false, label: 'nojs'}, async t => {
      const response = await gotoRoute(t);
      t.check('Route answers 200 without JS', response?.status() === 200);
      await noJsChecks(t);
      if (typeof mod.noJs === 'function') await mod.noJs(t);
      t.check('No 4xx/5xx without JS', t.events.failures.length === 0, t.events.failures);
    });
  }

  // Shared components (K5, K6, K7/K8, K9, K10, K11, K19) on a real page.
  if (!only.length || only.includes('components')) {
    for (const [width, height, query] of [[390, 844, '?ref=dm'], [1440, 1000, '?ref=spam']]) {
      await step(env, {route: `/privacidade${query}`, slug: 'components', width, height, label: 'components'}, async t => {
        await withHeaderCta(t.context, t.base);
        await gotoRoute(t);
        await shellChecks(t);
        await componentChecks(t);
        await idleRafCheck(t, 'after the component interactions');
        await cleanChecks(t);
      });
    }
    await step(env, {route: '/privacidade', slug: 'components', width: 390, height: 844, reducedMotion: 'reduce', label: 'components-reduced'}, async t => {
      await gotoRoute(t);
      await componentReducedChecks(t);
      await cleanChecks(t);
    });
  }
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(report, null, 2));
  await browser?.close();
  server?.kill();
}
const failed = report.results.filter(row => row.failure);
console.log(JSON.stringify({base, runs: report.results.length, failed: failed.map(row => ({route: row.route, width: row.width, label: row.label, failure: row.failure}))}, null, 2));
if (failed.length) throw new Error(`Pages audit failed; inspect ${output}/results.json`);
