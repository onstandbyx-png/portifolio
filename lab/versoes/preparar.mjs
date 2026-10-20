/* Prepares every portfolio era listed in lab/versoes/portfolio.json under
 * lab/.versoes/<id>/: downloads the commit (public repo tarball, or `git archive`
 * when LAB_VERSOES_GIT=1 for local runs), links node_modules and runs that era's
 * own build. Each era is later started with its own server.mjs by lab/server.mjs.
 * A failed era is recorded in status.json and skipped; it never fails the build. */
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {mkdir, readFile, rm, symlink, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join, resolve} from 'node:path';

const LAB = fileURLToPath(new URL('..', import.meta.url));
const ROOT = resolve(LAB, '..');
const OUT = join(LAB, '.versoes');
const REPO = 'onstandbyx-png/portifolio';
const {eras} = JSON.parse(await readFile(join(LAB, 'versoes', 'portfolio.json'), 'utf8'));

const run = (cmd, args, opts = {}) => new Promise((ok, fail) => {
  const child = spawn(cmd, args, {stdio: ['pipe', 'inherit', 'inherit'], ...opts});
  child.on('error', fail);
  child.on('close', code => (code === 0 ? ok() : fail(new Error(`${cmd} ${args.join(' ')} → ${code}`))));
  if (opts.input) { opts.input.pipe(child.stdin); } else child.stdin.end();
});

async function extract(commit, dir) {
  if (process.env.LAB_VERSOES_GIT === '1') {
    const git = spawn('git', ['archive', commit], {cwd: ROOT, stdio: ['ignore', 'pipe', 'inherit']});
    return run('tar', ['-x', '-C', dir], {input: git.stdout});
  }
  const res = await fetch(`https://codeload.github.com/${REPO}/tar.gz/${commit}`);
  if (!res.ok) throw new Error(`tarball ${commit}: HTTP ${res.status}`);
  const {Readable} = await import('node:stream');
  return run('tar', ['-xz', '--strip-components=1', '-C', dir], {input: Readable.fromWeb(res.body)});
}

await mkdir(OUT, {recursive: true});
const status = {};
for (const era of eras) {
  const dir = join(OUT, era.id);
  const started = Date.now();
  try {
    await rm(dir, {recursive: true, force: true});
    await mkdir(dir, {recursive: true});
    await extract(era.commit, dir);
    if (!existsSync(join(dir, 'server.mjs'))) throw new Error('sem server.mjs');
    await symlink(join(ROOT, 'node_modules'), join(dir, 'node_modules'), 'dir');
    if (existsSync(join(dir, 'scripts', 'build-badges.mjs'))) await run('node', ['scripts/build-badges.mjs'], {cwd: dir});
    status[era.id] = {ok: true, ms: Date.now() - started};
    console.log(`versão ${era.id} (${era.commit.slice(0, 7)}) pronta`);
  } catch (error) {
    status[era.id] = {ok: false, error: String(error.message || error)};
    console.error(`versão ${era.id} falhou: ${error.message}`);
  }
}
await writeFile(join(OUT, 'status.json'), JSON.stringify(status, null, 1));
