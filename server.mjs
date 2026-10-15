import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, resolve, sep } from 'node:path';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const port = Number(process.env.PORT || 3000);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon','.mp4':'video/mp4','.webm':'video/webm'};
const routes = new Map([
  ['/','index.html'],['/index.html','index.html'],
  ['/assets/portfolio.css','src/styles.css'],['/assets/portfolio.js','src/portfolio.js'],
]);
const assetCache = new Map();
const externalAssets = new Map([["/assets/smiile-landscape.webp", "https://smiile-landing-preview.up.railway.app/assets/architecture-coast.webp"]]);
const headers = {
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'Content-Security-Policy':"default-src 'self'; img-src 'self' data: https://smiile-landing-preview.up.railway.app https://midia-kit-production-c234.up.railway.app; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
};
createServer(async (req,res)=>{
  const url = new URL(req.url || '/', 'http://localhost');
  let path; try { path=decodeURIComponent(url.pathname); } catch { res.writeHead(400,headers); res.end('Invalid path'); return; }
  if(path==='/health'){res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8',...headers});res.end('ok');return;}
  if(externalAssets.has(path)) {
    try {
      let body=assetCache.get(path);
      if(!body){const remote=await fetch(externalAssets.get(path),{signal:AbortSignal.timeout(9000)});if(!remote.ok)throw new Error("Upstream returned "+remote.status);body=Buffer.from(await remote.arrayBuffer());assetCache.set(path,body)}
      res.writeHead(200,{'Content-Type':'image/webp','Cache-Control':'public, max-age=86400',...headers});res.end(body);return;
    } catch(err){res.writeHead(503,headers);res.end('Asset temporarily unavailable');return;}
  }
  const relative=routes.get(path) ?? (path.startsWith('/assets/') ? 'public'+path : null);
  if(!relative || relative.includes('\0')){res.writeHead(404,headers);res.end('Not found');return;}
  const full=resolve(root,relative);
  if(!(full===root || full.startsWith(root+sep))){res.writeHead(403,headers);res.end('Forbidden');return;}
  try{
    const body=await readFile(full);
    const type=mime[extname(full)]??'application/octet-stream';
    if(type.startsWith('video/')){
      const range=req.headers.range;
      const mediaHeaders={'Content-Type':type,'Accept-Ranges':'bytes','Cache-Control':'public, max-age=86400',...headers};
      if(range){
        const match=/^bytes=(\d*)-(\d*)$/.exec(range);
        if(!match){res.writeHead(416,{'Content-Range':'bytes */'+body.length,...mediaHeaders});res.end();return;}
        const start=match[1]?Number(match[1]):Math.max(0,body.length-Number(match[2]));
        const end=match[2]&&match[1]?Math.min(body.length-1,Number(match[2])):body.length-1;
        if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=body.length){
          res.writeHead(416,{'Content-Range':'bytes */'+body.length,...mediaHeaders});res.end();return;
        }
        res.writeHead(206,{'Content-Range':'bytes '+start+'-'+end+'/'+body.length,'Content-Length':end-start+1,...mediaHeaders});
        res.end(body.subarray(start,end+1));return;
      }
      res.writeHead(200,{'Content-Length':body.length,...mediaHeaders});res.end(body);return;
    }
    res.writeHead(200,{'Content-Type':type,'Cache-Control':type.startsWith('image/')?'public, max-age=86400':'no-cache',...headers});res.end(body);
  }catch {res.writeHead(404,headers);res.end('Not found')}
}).listen(port,'0.0.0.0',()=>console.log(`Portfolio ${process.env.PORT||3000} ready`));