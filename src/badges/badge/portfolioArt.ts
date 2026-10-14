import { TEX, type CardArt } from "./art";
type MaybeImage = HTMLImageElement | null;
type Ctx = CanvasRenderingContext2D;
const SANS='Inter, "Segoe UI", Arial, sans-serif';
const SERIF='Georgia, "Times New Roman", serif';
const cache=new Map<string, Promise<MaybeImage>>();
function img(src:string):Promise<MaybeImage>{
  if(cache.has(src))return cache.get(src)!;
  const promise=new Promise<MaybeImage>(resolve=>{
    const image=new Image();let settled=false;
    const done=(value:MaybeImage)=>{if(settled)return;settled=true;clearTimeout(timeout);resolve(value)};
    const timeout=setTimeout(()=>done(null),9000);
    image.decoding="async";image.onload=()=>done(image);image.onerror=()=>done(null);image.src=src;
  });
  cache.set(src,promise);return promise;
}
function surface(color:string):[HTMLCanvasElement,Ctx]{
  const c=document.createElement("canvas");c.width=TEX.w;c.height=TEX.h;
  const ctx=c.getContext("2d")!;ctx.fillStyle=color;ctx.fillRect(0,0,c.width,c.height);return[c,ctx];
}
function rr(ctx:Ctx,x:number,y:number,w:number,h:number,r:number){
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);
}
function word(ctx:Ctx,str:string,x:number,y:number,size:number,color:string,weight=600,font=SANS){
  ctx.fillStyle=color;ctx.textBaseline="alphabetic";ctx.font=`${weight} ${size}px ${font}`;ctx.fillText(str,x,y);
}
function cover(ctx:Ctx,image:MaybeImage,x:number,y:number,w:number,h:number,color:string){
  rr(ctx,x,y,w,h,20);ctx.save();ctx.clip();ctx.fillStyle=color;ctx.fillRect(x,y,w,h);
  if(image?.naturalWidth){
    const iw=image.naturalWidth,ih=image.naturalHeight;
    const scale=Math.max(w/iw,h/ih),sw=w/scale,sh=h/scale;
    ctx.drawImage(image,(iw-sw)/2,(ih-sh)/2,sw,sh,x,y,w,h);
  }else{
    ctx.fillStyle="#e5e9e2";ctx.fillRect(x+20,y+20,w-40,h-40);
    word(ctx,"Portfólio / peça original",x+55,y+h/2,49,"#627361",500);
  }
  ctx.restore();
}
function top(ctx:Ctx,brand:string,count:string,dark=false){
  const c=dark?"#f3f5ed":"#203529";
  word(ctx,brand,72,151,80,c,800);
  word(ctx,count,706,139,29,dark?"#b7c5bb":"#708273",700);
  ctx.strokeStyle=dark?"#ffffff3b":"#cbd4c9";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(70,184);ctx.lineTo(952,184);ctx.stroke();
}
function backInfo(ctx:Ctx,label:string,title:string,details:string[],dark=false){
  const fg=dark?"#f0f2e9":"#20352c",muted=dark?"#b9c8bc":"#6f8377";
  word(ctx,label,73,325,32,muted,700);
  const parts=title.split("\n");parts.forEach((p,i)=>word(ctx,p,72,418+i*90,77,fg,700,SERIF));
  let y=745;for(const detail of details){ctx.fillStyle=dark?"#30493c":"#e8ede6";rr(ctx,69,y-51,887,79,15);ctx.fill();word(ctx,detail,100,y,38,fg,500);y+=103}
  ctx.strokeStyle=dark?"#52675a":"#cbd4c9";ctx.beginPath();ctx.moveTo(74,1125);ctx.lineTo(950,1125);ctx.stroke();
  word(ctx,"IDEIA ↗ EXECUÇÃO",73,1200,47,fg,800);
  word(ctx,"PORTFÓLIO / 2026",73,1263,26,muted,700);
}
export async function editorialCard(copy:{name:string;label:string;line:string}):Promise<CardArt>{
  await document.fonts?.ready;
  const picture=await img("/assets/fatos-editorial-detail.webp");
  const [front,ctx]=surface("#f6f7f2");
  top(ctx,"FATOS.","01 / EDITORIAL");
  cover(ctx,picture,72,214,880,662,"#f7f7f1");
  word(ctx,"REDAÇÃO + IDEIAS",73,957,32,"#52755a",750);
  word(ctx,"Da pesquisa",72,1061,79,"#203529",600,SERIF);
  word(ctx,"à narrativa.",72,1147,79,"#203529",600,SERIF);
  word(ctx,"EXPERIÊNCIA EDITORIAL • MATERIAL DE ORIGEM",73,1252,24,"#768778",650);
  const [back,b]=surface("#e7eee3");top(b,"FATOS.","01 / EDITORIAL");
  backInfo(b,"O QUE EU DESENVOLVO","Uma pergunta\ncria a pauta.",["Pesquisa e recorte editorial","Roteiros, posts e carrosséis","Texto e direção de narrativa"]);
  return{front,back};
}
export async function digitalCard(copy:{name:string;label:string;line:string}):Promise<CardArt>{
  await document.fonts?.ready;
  const picture=await img("/assets/smiile-landscape.webp");
  const [front,ctx]=surface("#1b2c25");
  top(ctx,"smiile.","02 / DIGITAL",true);
  cover(ctx,picture,62,210,900,670,"#2c4a35");
  word(ctx,"UX / FRONTEND / SISTEMAS",73,971,31,"#bfd6ac",750);
  word(ctx,"Uma ideia",72,1072,80,"#f6f5ed",600,SERIF);
  word(ctx,"ganha vida.",72,1164,80,"#f6f5ed",600,SERIF);
  word(ctx,"DEMONSTRAÇÃO DE PRODUTO • SMIILE",73,1252,24,"#b1c7b5",650);
  const[back,b]=surface("#243a2e");top(b,"smiile.","02 / DIGITAL",true);
  backInfo(b,"O QUE EU CONSTRUO","Interfaces\nque respondem.",["Landing pages e sites","Componentes interativos","Sistemas e automações"],true);
  return{front,back};
}
