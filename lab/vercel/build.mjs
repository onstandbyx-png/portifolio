/* Vercel build for the lab: fetches this repository at LAB_COMMIT (public
 * tarball), prepares every portfolio era and writes the static export to out/. */
import {spawn} from 'node:child_process';
import {mkdirSync, symlinkSync} from 'node:fs';
import {Readable} from 'node:stream';

const COMMIT = process.env.LAB_COMMIT || 'ccr-982a6ce6-s02tyu';
const run = (cmd, args, opts = {}) => new Promise((ok, fail) => {
  const child = spawn(cmd, args, {stdio: [opts.input ? 'pipe' : 'ignore', 'inherit', 'inherit'], ...opts});
  if (opts.input) opts.input.pipe(child.stdin);
  child.on('close', code => (code === 0 ? ok() : fail(new Error(`${cmd} → ${code}`))));
});
mkdirSync('repo', {recursive: true});
const res = await fetch(`https://codeload.github.com/onstandbyx-png/portifolio/tar.gz/${COMMIT}`);
if (!res.ok) throw new Error(`repositório: HTTP ${res.status}`);
await run('tar', ['-xz', '--strip-components=1', '-C', 'repo'], {input: Readable.fromWeb(res.body)});
symlinkSync('../node_modules', 'repo/node_modules', 'dir');
await run('node', ['repo/lab/versoes/preparar.mjs']);
await run('node', ['repo/lab/vercel/exportar.mjs', 'out']);
