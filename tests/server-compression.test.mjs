import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer,request} from 'node:http';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {brotliDecompressSync,gunzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('..',import.meta.url));
const bundle=new URL('../public/assets/badge-build/',import.meta.url);
let server,port;
const freePort=()=>new Promise((ok,fail)=>{const probe=createServer();probe.once('error',fail);probe.listen(0,'127.0.0.1',()=>{const {port}=probe.address();probe.close(()=>ok(port));});});
const get=(path,headers={},method='GET')=>new Promise((ok,fail)=>{const req=request({host:'127.0.0.1',port,path,method,headers,agent:false},res=>{const chunks=[];res.on('data',chunk=>chunks.push(chunk));res.on('end',()=>ok({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));});req.on('error',fail);req.end();});
const csp=response=>assert.match(response.headers['content-security-policy']||'',/default-src 'self'.*script-src 'self'/,'CSP header still present');
const varies=response=>assert.match(response.headers.vary||'',/accept-encoding/i,'Vary: Accept-Encoding');

before(async()=>{
  port=await freePort();
  server=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,PORT:String(port)},stdio:'ignore'});
  for(let i=0;i<100;i++){try{if((await get('/health')).status===200)return;}catch{}await new Promise(resolve=>setTimeout(resolve,50));}
  throw new Error('server.mjs did not start');
});
after(()=>server?.kill());

async function assertNegotiated(path){
  const identity=await get(path,{'accept-encoding':'identity'});
  assert.equal(identity.status,200,path);assert.equal(identity.headers['content-encoding'],undefined,path);varies(identity);csp(identity);
  const plain=await get(path);
  assert.equal(plain.headers['content-encoding'],undefined,'No Accept-Encoding keeps identity: '+path);assert.deepEqual(plain.body,identity.body);
  const br=await get(path,{'accept-encoding':'gzip, deflate, br'});
  assert.equal(br.status,200,path);assert.equal(br.headers['content-encoding'],'br',path);varies(br);csp(br);
  assert.equal(Number(br.headers['content-length']),br.body.length,path);assert(br.body.length<identity.body.length,'Brotli is smaller: '+path);
  assert.deepEqual(brotliDecompressSync(br.body),identity.body,'Brotli body decompresses to the identity body: '+path);
  const gzip=await get(path,{'accept-encoding':'gzip'});
  assert.equal(gzip.status,200,path);assert.equal(gzip.headers['content-encoding'],'gzip',path);varies(gzip);csp(gzip);
  assert.deepEqual(gunzipSync(gzip.body),identity.body,'Gzip body decompresses to the identity body: '+path);
  assert.equal(identity.headers['content-type'],br.headers['content-type']);assert.equal(identity.headers['cache-control'],br.headers['cache-control'],'Caching rules unchanged: '+path);
  return {identity,br,gzip};
}

test('HTML, CSS, JS, JSON e SVG negociam br e gzip com Vary e corpo idêntico ao identity',async()=>{
  for(const path of ['/','/assets/portfolio.css','/assets/portfolio.js','/assets/fonts/font-receipt.json','/assets/creative/sistemas.svg'])await assertNegotiated(path);
});

test('br recusado com q=0 cai para gzip; sem codificação aceita fica identity',async()=>{
  assert.equal((await get('/',{'accept-encoding':'br;q=0, gzip'})).headers['content-encoding'],'gzip');
  assert.equal((await get('/',{'accept-encoding':'br;q=0, gzip;q=0'})).headers['content-encoding'],undefined);
  assert.equal((await get('/',{'accept-encoding':'*'})).headers['content-encoding'],'br');
});

test('HEAD continua funcionando e anuncia a mesma codificação do GET',async()=>{
  const head=await get('/assets/portfolio.css',{'accept-encoding':'br'},'HEAD'),body=await get('/assets/portfolio.css',{'accept-encoding':'br'});
  assert.equal(head.status,200);assert.equal(head.body.length,0);assert.equal(head.headers['content-encoding'],'br');varies(head);csp(head);
  assert.equal(head.headers['content-length'],body.headers['content-length']);
  const plain=await get('/',{},'HEAD');assert.equal(plain.status,200);assert.equal(plain.body.length,0);csp(plain);
});

test('Imagens, fontes, vídeo e áudio nunca são comprimidos',async()=>{
  for(const [path,file] of [['/assets/smiile-landscape.webp','public/assets/smiile-landscape.webp'],['/assets/creative/og-cover.png','public/assets/creative/og-cover.png'],['/assets/fonts/InterVariable.woff2','public/assets/fonts/InterVariable.woff2'],['/assets/kinetic-pass/material-loop.mp4','public/assets/kinetic-pass/material-loop.mp4'],['/assets/portfolio/recovered-smiile/agents-call-pt-br.mp3','public/assets/portfolio/recovered-smiile/agents-call-pt-br.mp3']]){
    const response=await get(path,{'accept-encoding':'br, gzip'});
    assert.equal(response.status,200,path);assert.equal(response.headers['content-encoding'],undefined,path);assert.equal(response.headers.vary,undefined,path);csp(response);
    assert.deepEqual(response.body,readFileSync(new URL('../'+file,import.meta.url)),path);
  }
});

test('Requisições com Range não são comprimidas e o Range de mídia continua exato',async()=>{
  const css=await get('/assets/portfolio.css',{'accept-encoding':'br, gzip',range:'bytes=0-99'});
  assert.equal(css.status,200);assert.equal(css.headers['content-encoding'],undefined);varies(css);csp(css);
  assert.deepEqual(css.body,(await get('/assets/portfolio.css',{'accept-encoding':'identity'})).body);
  const video=await get('/assets/kinetic-pass/material-loop.mp4',{'accept-encoding':'br, gzip',range:'bytes=0-127'});
  assert.equal(video.status,206);assert.equal(video.headers['content-encoding'],undefined);assert.match(video.headers['content-range'],/^bytes 0-127\/\d+$/);assert.equal(video.body.length,128);csp(video);
});

test('Bundle 3D do crachá (npm run build) é servido comprimido',{skip:!existsSync(new URL('index.js',bundle))&&'run npm run build first'},async()=>{
  const paths=['/assets/badge-build/index.js',...readdirSync(new URL('chunks/',bundle)).filter(name=>name.endsWith('.js')).map(name=>'/assets/badge-build/chunks/'+name)];
  assert(paths.length>1,'Badge scene chunk exists');
  for(const path of paths)await assertNegotiated(path);
});
