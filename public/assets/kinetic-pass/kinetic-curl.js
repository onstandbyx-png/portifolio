/* Curved paper curl: segmented WebGL mesh, normals-based diffuse and specular.
   Optional renderer; the SVG reflective flap remains the functional fallback. */
const W=300,H=500;
function shader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'Shader compile failed');return s;}
function program(gl,v,f){const p=gl.createProgram();gl.attachShader(p,shader(gl,gl.VERTEX_SHADER,v));gl.attachShader(p,shader(gl,gl.FRAGMENT_SHADER,f));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'Shader link failed');return p;}
const vertex=String.raw`attribute vec2 a_position;
uniform vec4 u_line;uniform float u_radius;uniform float u_depth;
varying vec2 v_old;varying float v_bend;varying float v_distance;
void main(){
  float l=max(length(u_line.xy),0.001);
  vec2 n=u_line.xy/l;
  float d=(dot(u_line.xy,a_position)+u_line.z)/l;
  float q=max(0.0,-d);
  float theta=min(q/max(u_radius,1.0),3.14159265);
  float advance=u_radius*sin(theta)-max(0.0,q-3.14159265*u_radius);
  float lift=u_radius*(1.0-cos(theta));
  vec2 p=a_position+n*(q-advance);
  p+=vec2(-0.17,-0.28)*lift;
  gl_Position=vec4(p.x/300.0*2.0-1.0,1.0-p.y/500.0*2.0,clamp(lift/100.0,0.0,0.99),1.0);
  v_old=a_position;v_bend=theta;v_distance=d;
}`;
const fragment=String.raw`precision mediump float;
varying vec2 v_old;varying float v_bend;varying float v_distance;
uniform float u_light;uniform float u_peel;uniform vec2 u_wobble;uniform vec3 u_tint;
float roundedRect(vec2 p,vec2 s,float r){vec2 d=abs(p-s*.5)-(s*.5-r);return length(max(d,0.0))+min(max(d.x,d.y),0.0)-r;}
void main(){
  if(v_distance>0.003)discard;
  if(roundedRect(v_old,vec2(300.,500.),19.)>0.)discard;
  if(v_old.x>120.&&v_old.x<180.&&v_old.y>21.&&v_old.y<33.)discard;
  if(length(v_old-vec2(0.,377.))<14.||length(v_old-vec2(300.,377.))<14.)discard;
  float arc=sin(v_bend);
  // The light follows the viewing angle in radians, independently from the bend.
  float lightAngle=0.86+u_wobble.x*0.018-u_wobble.y*0.012;
  float diffuse=0.24+0.48*max(0.0,cos(v_bend-lightAngle));
  float spec=pow(max(0.0,cos(v_bend-lightAngle)),30.0)*0.38;
  float grain=(fract(sin(dot(v_old,vec2(12.9898,78.233)))*43758.5453)-0.5)*0.016;
  vec3 matte=vec3(.105,.111,.117),graphite=vec3(.29,.295,.30);
  vec3 color=mix(matte,graphite,diffuse)+mix(vec3(.84,.87,.90),u_tint,.25)*spec+grain;
  float edge=pow(max(0.0,arc),12.0);
  color+=u_tint*edge*.14;
  float highlight=pow(max(0.0,sin(v_bend*2.0+u_light*.06)),7.0);
  color+=vec3(.05,.05,.055)*highlight;
  vec3 cornerColor=u_tint*(.72+diffuse*.42)+vec3(.14)*spec;
  color=mix(color,cornerColor,1.0-smoothstep(0.0,.07,u_peel));
  gl_FragColor=vec4(clamp(color,0.,.99),1.0);
}`;
function vertices(nx=75,ny=125){
 const positions=new Float32Array((nx+1)*(ny+1)*2),indices=new Uint16Array(nx*ny*6);let c=0,k=0;
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){positions[c++]=W*i/nx;positions[c++]=H*j/ny;}
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const v=j*(nx+1)+i;indices.set([v,v+nx+1,v+1,v+1,v+nx+1,v+nx+2],k);k+=6;}
 return{positions,indices};
}
export function curlProfile(distance,radius){
 const q=Math.max(0,distance),r=Math.max(1,radius),angle=Math.min(q/r,Math.PI);
 return{angle,projection:r*Math.sin(angle)-Math.max(0,q-Math.PI*r),lift:r*(1-Math.cos(angle))};
}
export function createCurlRenderer(canvas,{forceFallback=false}={}){
 if(forceFallback||!canvas)return null;
 let gl;try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,preserveDrawingBuffer:true,stencil:false,depth:false});if(!gl)return null;}catch{return null;}
 let prog;try{prog=program(gl,vertex,fragment);}catch(e){console.warn('Curved fold unavailable:',e);return null;}
 const mesh=vertices(),v=gl.createBuffer(),ib=gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER,v);gl.bufferData(gl.ARRAY_BUFFER,mesh.positions,gl.STATIC_DRAW);
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.indices,gl.STATIC_DRAW);
 const location=gl.getAttribLocation(prog,'a_position');
 const u={line:gl.getUniformLocation(prog,'u_line'),radius:gl.getUniformLocation(prog,'u_radius'),depth:gl.getUniformLocation(prog,'u_depth'),light:gl.getUniformLocation(prog,'u_light'),peel:gl.getUniformLocation(prog,'u_peel'),wobble:gl.getUniformLocation(prog,'u_wobble'),tint:gl.getUniformLocation(prog,'u_tint')};
 let alive=true,last=null;
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();alive=false;});
 function draw({depth=0,slope=0,peel=0,time=0,yaw=0,pitch=0,finish='gold'}={}){
  if(!alive)return false;
  const pixelRatio=typeof devicePixelRatio==='number'?Math.min(devicePixelRatio,2):1;
  const width=Math.round(W*pixelRatio),height=Math.round(H*pixelRatio);
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
  gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.disable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  gl.useProgram(prog);gl.bindBuffer(gl.ARRAY_BUFFER,v);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);
  gl.uniform4f(u.line,-slope,1,slope*W-depth,0);gl.uniform1f(u.radius,14+21*peel);
  gl.uniform1f(u.depth,depth);gl.uniform1f(u.peel,peel);gl.uniform1f(u.light,time);gl.uniform2f(u.wobble,yaw,pitch);
  const tint=finish==='silver'?[.78,.82,.86]:finish==='copper'?[.91,.53,.32]:[.91,.73,.34];gl.uniform3f(u.tint,...tint);
  gl.drawElements(gl.TRIANGLES,mesh.indices.length,gl.UNSIGNED_SHORT,0);
  last={depth,slope,peel,time,yaw,pitch,finish};return true;
 }
 function destroy(){alive=false;gl.deleteBuffer(v);gl.deleteBuffer(ib);gl.deleteProgram(prog);}
 return{draw,destroy,get active(){return alive},get last(){return last}};
}
