import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';

const port = Number(process.env.PORT || 3000);
const files = {
  '/': ['./index.html','text/html; charset=utf-8'],
  '/index.html': ['./index.html','text/html; charset=utf-8'],
  '/assets/portfolio.css': ['./src/styles.css','text/css; charset=utf-8'],
  '/assets/portfolio.js': ['./src/portfolio.js','text/javascript; charset=utf-8'],
};
const contents = await Promise.all(Object.values(files).map(async ([file]) => readFile(new URL(file, import.meta.url))));
const blobs = Object.fromEntries(Object.keys(files).map((key, i) => [key, {content:contents[i], mime:files[key][1]}]));
const baseHeaders={
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'Content-Security-Policy':"default-src 'self'; img-src 'self' https://smiile-landing-preview.up.railway.app https://midia-kit-production-c234.up.railway.app; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
};
createServer((req, res) => {
  const path = new URL(req.url || '/', 'http://localhost').pathname;
  if(path==='/health'){
    res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8', ...baseHeaders});res.end('ok');return;
  }
  const item=blobs[path];
  if(!item){res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8', ...baseHeaders});res.end('Not found');return;}
  res.writeHead(200, {'Content-Type':item.mime,'Cache-Control':path.endsWith('.css')||path.endsWith('.js')?'public, max-age=600':'no-cache',...baseHeaders});
  res.end(item.content);
}).listen(port,'0.0.0.0',()=>console.log(`Portfolio listening on :${port}`));
