import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, resolve, sep } from 'node:path';
import { promisify } from 'node:util';
import { brotliCompress, gzip, constants } from 'node:zlib';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const port = Number(process.env.PORT || 3000);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon','.mp4':'video/mp4','.webm':'video/webm','.mp3':'audio/mpeg','.json':'application/json; charset=utf-8','.woff2':'font/woff2','.ttf':'font/ttf'};
const routes = new Map([
  ['/','index.html'],['/index.html','index.html'],
  ['/assets/portfolio.css','src/styles.css'],['/assets/portfolio.js','src/portfolio.js'],
]);
const headers = {
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'Content-Security-Policy':"default-src 'self'; img-src 'self' data: https://smiile-landing-preview.up.railway.app https://midia-kit-production-c234.up.railway.app; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
};
// Text responses are compressed once per file version (path + mtime + size) and kept in memory.
// Raster images, fonts, video, audio and range requests always stay identity.
const compressible=/^(?:text\/|application\/json|image\/svg\+xml)/;
const compressors={br:promisify(brotliCompress),gzip:promisify(gzip)};
const compressed=new Map();
const accepts=(header,coding)=>{let own,any;for(const part of String(header||'').toLowerCase().split(',')){const [name,...params]=part.split(';').map(item=>item.trim());const q=params.find(item=>item.startsWith('q='));const weight=q?Number(q.slice(2)):1;if(name===coding)own=weight;else if(name==='*')any=weight;}return (own??any??0)>0;};
const negotiate=header=>['br','gzip'].find(coding=>accepts(header,coding))??null;
const brotli=(body,quality)=>compressors.br(body,{params:{[constants.BROTLI_PARAM_QUALITY]:quality,[constants.BROTLI_PARAM_SIZE_HINT]:body.length}});
// Brotli 11 takes ~1.3 s on the 626 KB badge chunk: large files answer from a fast pass (~25 ms)
// while the dense pass runs in the background and replaces it for later requests.
const denseLimit=128*1024;
function encode(full,info,coding){
  let entry=compressed.get(full);
  if(entry?.mtimeMs!==info.mtimeMs||entry.size!==info.size)compressed.set(full,entry={mtimeMs:info.mtimeMs,size:info.size});
  return entry[coding]??=readFile(full)
    .then(body=>{
      if(body.length!==info.size)return null;
      if(coding==='gzip')return compressors.gzip(body,{level:9});
      if(body.length<=denseLimit)return brotli(body,11);
      brotli(body,11).then(out=>{if(compressed.get(full)===entry&&out.length<info.size)entry.br=Promise.resolve(out);},()=>{});
      return brotli(body,5);
    })
    .then(out=>out&&out.length<info.size?out:null,()=>{delete entry[coding];return null;});
}
createServer(async (req,res)=>{
  const url = new URL(req.url || '/', 'http://localhost');
  let path; try { path=decodeURIComponent(url.pathname); } catch { res.writeHead(400,headers); res.end('Invalid path'); return; }
  if(path==='/health'){res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8',...headers});res.end('ok');return;}
  const relative=routes.get(path) ?? (path.startsWith('/assets/') ? 'public'+path : null);
  if(!relative || relative.includes('\0')){res.writeHead(404,headers);res.end('Not found');return;}
  const full=resolve(root,relative);
  if(!(full===root || full.startsWith(root+sep))){res.writeHead(403,headers);res.end('Forbidden');return;}
  try{
    const type=mime[extname(full)]??'application/octet-stream';
    const coding=compressible.test(type)&&!req.headers.range?negotiate(req.headers['accept-encoding']):null;
    const encoded=coding?await encode(full,await stat(full),coding):null;
    const body=encoded??await readFile(full);
    if(type.startsWith('video/')||type.startsWith('audio/')){
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
    res.writeHead(200,{'Content-Type':type,'Cache-Control':type.startsWith('image/')?'public, max-age=86400':'no-cache',...(compressible.test(type)?{'Vary':'Accept-Encoding'}:{}),...(encoded?{'Content-Encoding':coding,'Content-Length':encoded.length}:{}),...headers});res.end(body);
  }catch {res.writeHead(404,headers);res.end('Not found')}
}).listen(port,'0.0.0.0',()=>console.log(`Portfolio ${process.env.PORT||3000} ready`));