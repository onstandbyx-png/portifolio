/* Geometry measured from the supplied 1080px, 60fps knockout-pass reference.
   Independent implementation. All geometry is in a fixed 300 x 500 design space. */
export const WIDTH=300,HEIGHT=500,DURATION=25.6;
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
export const ease=v=>{const t=clamp(v);return t*t*(3-2*t);};
export function normalizeTitle(value){const text=String(value??'').replace(/[<>&\u0000-\u001f]/g,'').trim();return Array.from(text||'ideia').slice(0,8).join('');}
function clip(polygon,a,b,c,positive){
 const out=[];for(let i=0;i<polygon.length;i++){
  const s=polygon[i],e=polygon[(i+1)%polygon.length];
  const ds=a*s[0]+b*s[1]+c,de=a*e[0]+b*e[1]+c;
  const si=positive?ds>=0:ds<=0,ei=positive?de>=0:de<=0;
  if(si)out.push(s);
  if(si!==ei){const t=ds/(ds-de);out.push([s[0]+t*(e[0]-s[0]),s[1]+t*(e[1]-s[1])]);}
 }return out;
}
export function peelGeometry(value){
 const p=clamp(value),m=.92*(1-ease(p/.45)),d=17+217*p;
 // y = m(x-WIDTH)+d; positive side is the remaining front of the sticker.
 const a=-m,b=1,c=m*WIDTH-d,den=a*a+b*b;
 const rect=[[0,0],[WIDTH,0],[WIDTH,HEIGHT],[0,HEIGHT]];
 const front=clip(rect,a,b,c,true),cut=clip(rect,a,b,c,false);
 const reflect=([x,y])=>{const f=2*(a*x+b*y+c)/den;return[x-a*f,y-b*f];};
 const flap=cut.map(reflect);
 const matrix=[1-2*a*a/den,-2*a*b/den,-2*a*b/den,1-2*b*b/den,-2*a*c/den,-2*b*c/den];
 const crease=clip(rect,a,b,c,true).filter(([x,y])=>Math.abs(a*x+b*y+c)<.01);
 return{front,flap,matrix,crease,depth:d,slope:m,width:WIDTH,height:HEIGHT};
}
export const points=vertices=>vertices.map(p=>p.map(v=>v.toFixed(3)).join(',')).join(' ');
export const polygonPath=vertices=>vertices.length?'M'+vertices.map(p=>p.map(v=>v.toFixed(3)).join(' ')).join('L')+'Z':'';
function track(t,keys){if(t<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++){if(t<=keys[i][0]){const [a,v]=keys[i-1],[b,w]=keys[i];return v+(w-v)*ease((t-a)/(b-a));}}return keys.at(-1)[1];}
export function sampleTimeline(seconds){
 const t=clamp(seconds,0,DURATION);
 return{
  peel:track(t,[[0,0],[1.2,0],[1.8,.15],[2.7,.5],[3.5,1],[3.9,.85],[4.9,0],[22.7,0],[23.55,.21],[24.15,0],[25.6,0]]),
  layers:track(t,[[0,0],[10,0],[11.15,1],[13.6,1],[14.75,0],[25.6,0]]),
  notes:t>=5.8&&t<10,
  title:t<18.4?'ideia':t<18.75?'cr':t<19.1?'crie':'crie!',
  pitch:2+Math.sin(t*.7)*3,
  yaw:-6+Math.sin(t*.54)*7,
  phase:t<1.2?'A peça':t<4.9?'Revelar o material':t<10?'Texto e textura':t<14.75?'As quatro camadas':t<18.4?'De volta à peça':t<22.7?'Personalização':'Último detalhe'
 };
}
