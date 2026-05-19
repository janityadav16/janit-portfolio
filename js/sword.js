(function(){
'use strict';
const canvas=document.getElementById('swordCanvas');
if(!canvas)return;
const ctx=canvas.getContext('2d');
let W,H,scrollP=0,t=0,slashTrails=[],mouse={x:60,y:400};
function resize(){W=canvas.width=canvas.offsetWidth;H=canvas.height=window.innerHeight;canvas.height=H;}
window.addEventListener('resize',resize,{passive:true});
resize();
window.addEventListener('scroll',()=>{const max=document.body.scrollHeight-window.innerHeight;scrollP=max>0?window.scrollY/max:0;},{passive:true});
document.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;},{passive:true});
document.addEventListener('click',()=>{
  const col=scrollP<.33?'#5b6ef5':scrollP<.66?'#a855f7':'#22c55e';
  slashTrails.push({x:W/2,y:H*.5,angle:Math.random()*Math.PI-Math.PI/2,len:60+Math.random()*40,life:1,color:col});
},{passive:true});

function rgba(hex,a){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;}

function drawSword(cx,cy,len,angle,phase){
  ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);
  const tipY=-len,guardH=7,gripH=len*.18,pommelR=7;
  // blade glow
  const bg=ctx.createLinearGradient(0,tipY,0,0);
  bg.addColorStop(0,`rgba(129,140,248,${.3+Math.sin(phase)*.15})`);bg.addColorStop(.5,`rgba(91,110,245,.1)`);bg.addColorStop(1,'transparent');
  ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(0,tipY-8);ctx.lineTo(6,0);ctx.closePath();
  ctx.fillStyle=bg;ctx.filter='blur(7px)';ctx.fill();ctx.filter='none';
  // blade left
  ctx.beginPath();ctx.moveTo(0,tipY);ctx.lineTo(-3.5,-len*.1);ctx.lineTo(-2.5,0);ctx.closePath();
  ctx.fillStyle='rgba(200,215,255,.95)';ctx.fill();
  // blade right
  ctx.beginPath();ctx.moveTo(0,tipY);ctx.lineTo(3.5,-len*.1);ctx.lineTo(2.5,0);ctx.closePath();
  ctx.fillStyle='rgba(160,180,255,.85)';ctx.fill();
  // fuller
  const fg=ctx.createLinearGradient(0,tipY,0,0);fg.addColorStop(0,'rgba(91,110,245,.9)');fg.addColorStop(.4,'rgba(129,140,248,.6)');fg.addColorStop(1,'rgba(91,110,245,.2)');
  ctx.beginPath();ctx.moveTo(0,tipY+5);ctx.lineTo(-.8,-len*.05);ctx.lineTo(.8,-len*.05);ctx.closePath();ctx.fillStyle=fg;ctx.fill();
  // shimmer
  const sp=(Math.sin(phase*1.5)+1)/2,sy=tipY+sp*len*.9;
  const sh=ctx.createLinearGradient(0,sy-20,0,sy+20);sh.addColorStop(0,'transparent');sh.addColorStop(.5,'rgba(255,255,255,.55)');sh.addColorStop(1,'transparent');
  ctx.beginPath();ctx.moveTo(-1.5,sy-14);ctx.lineTo(0,sy-17);ctx.lineTo(1.5,sy-14);ctx.lineTo(1.5,sy+14);ctx.lineTo(0,sy+17);ctx.lineTo(-1.5,sy+14);ctx.closePath();ctx.fillStyle=sh;ctx.fill();
  // crossguard
  const gw=22,gg=ctx.createLinearGradient(-gw/2,0,gw/2,0);gg.addColorStop(0,'#1a2540');gg.addColorStop(.3,'#3d4f7c');gg.addColorStop(.5,'#5b6ef5');gg.addColorStop(.7,'#3d4f7c');gg.addColorStop(1,'#1a2540');
  ctx.beginPath();ctx.roundRect(-gw/2,-guardH/2,gw,guardH,3);ctx.fillStyle=gg;ctx.fill();
  ctx.strokeStyle='rgba(129,140,248,.5)';ctx.lineWidth=.5;ctx.stroke();
  [[-gw/2+5,0],[gw/2-5,0]].forEach(([gx,gy])=>{ctx.shadowColor='#5b6ef5';ctx.shadowBlur=8;ctx.fillStyle=`rgba(91,110,245,${.8+Math.sin(phase)*.2})`;ctx.beginPath();ctx.arc(gx,gy,2.5,0,Math.PI*2);ctx.fill();});
  ctx.shadowBlur=0;
  // grip
  const gripGrad=ctx.createLinearGradient(-3.5,0,3.5,0);gripGrad.addColorStop(0,'#111827');gripGrad.addColorStop(.5,'#1e2a4a');gripGrad.addColorStop(1,'#111827');
  ctx.beginPath();ctx.roundRect(-3.5,guardH/2,7,gripH,2);ctx.fillStyle=gripGrad;ctx.fill();
  ctx.strokeStyle='rgba(91,110,245,.3)';ctx.lineWidth=1.1;
  for(let i=0;i<6;i++){const wy=guardH/2+(i+.5)*(gripH/6);ctx.beginPath();ctx.moveTo(-2.5,wy);ctx.lineTo(2.5,wy);ctx.stroke();}
  // pommel
  const py=guardH/2+gripH,pr=ctx.createRadialGradient(-1,py,0,0,py,pommelR);pr.addColorStop(0,'#5b6ef5');pr.addColorStop(.5,'#3d4f7c');pr.addColorStop(1,'#1a2540');
  ctx.beginPath();ctx.arc(0,py,pommelR,0,Math.PI*2);ctx.fillStyle=pr;ctx.fill();
  ctx.strokeStyle='rgba(129,140,248,.4)';ctx.lineWidth=.7;ctx.stroke();
  ctx.shadowColor='#818cf8';ctx.shadowBlur=12+Math.sin(phase)*5;
  ctx.fillStyle=`rgba(129,140,248,${.6+Math.sin(phase*1.2)*.4})`;ctx.beginPath();ctx.arc(0,py,3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  // tip glow
  const tg=ctx.createRadialGradient(0,tipY,0,0,tipY,12);tg.addColorStop(0,`rgba(200,215,255,${.8+Math.sin(phase)*.2})`);tg.addColorStop(.4,'rgba(91,110,245,.4)');tg.addColorStop(1,'transparent');
  ctx.beginPath();ctx.arc(0,tipY,12,0,Math.PI*2);ctx.fillStyle=tg;ctx.fill();
  ctx.restore();
}

function drawTrack(){
  ctx.strokeStyle='rgba(91,110,245,.1)';ctx.lineWidth=1;ctx.setLineDash([4,8]);
  ctx.beginPath();ctx.moveTo(W-8,20);ctx.lineTo(W-8,H-20);ctx.stroke();ctx.setLineDash([]);
  const fH=(H-40)*scrollP;
  const pg=ctx.createLinearGradient(0,20,0,20+fH);pg.addColorStop(0,'rgba(91,110,245,.8)');pg.addColorStop(.5,'rgba(168,85,247,.7)');pg.addColorStop(1,'rgba(34,197,94,.8)');
  ctx.strokeStyle=pg;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W-8,20);ctx.lineTo(W-8,20+fH);ctx.stroke();
  const dc=scrollP<.33?'#5b6ef5':scrollP<.66?'#a855f7':'#22c55e';
  ctx.shadowColor=dc;ctx.shadowBlur=10;ctx.fillStyle=dc;ctx.beginPath();ctx.arc(W-8,20+fH,5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
}

function drawSlash(){
  slashTrails=slashTrails.filter(s=>s.life>0);
  slashTrails.forEach(s=>{
    s.life-=.04;
    ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.angle);
    const g=ctx.createLinearGradient(-s.len/2,0,s.len/2,0);
    g.addColorStop(0,'transparent');g.addColorStop(.5,rgba(s.color,s.life));g.addColorStop(1,'transparent');
    ctx.beginPath();ctx.moveTo(-s.len/2,0);ctx.lineTo(s.len/2,0);ctx.strokeStyle=g;ctx.lineWidth=7;ctx.stroke();
    ctx.beginPath();ctx.moveTo(-s.len/2,0);ctx.lineTo(s.len/2,0);ctx.strokeStyle=`rgba(255,255,255,${s.life*.7})`;ctx.lineWidth=1.5;ctx.stroke();
    ctx.restore();
  });
}

function getState(){
  const mi=(mouse.y/H-.5)*.12;
  if(scrollP<.15)return{len:80,angle:mi,cx:W/2,cy:H*.5};
  if(scrollP<.35)return{len:90,angle:Math.sin(t*.5)*.08+mi,cx:W/2,cy:H*.48};
  if(scrollP<.55)return{len:95,angle:Math.sin(t*.8)*.15+mi,cx:W/2,cy:H*.46};
  if(scrollP<.78)return{len:100,angle:-.2+Math.sin(t*.6)*.1+mi,cx:W/2,cy:H*.45};
  return{len:105,angle:Math.sin(t*1.2)*.05+mi,cx:W/2,cy:H*.44};
}

let raf;
function loop(){
  ctx.clearRect(0,0,W,H);t+=.016;
  const s=getState();
  drawTrack();drawSlash();
  drawSword(s.cx,s.cy,s.len,s.angle,t);
  const labels=['Hero','About','Skills','Projects','Contact'];
  const li=Math.min(4,Math.floor(scrollP*5));
  ctx.font='8px "JetBrains Mono",monospace';ctx.fillStyle=`rgba(91,110,245,${.4+Math.sin(t)*.1})`;ctx.textAlign='center';
  ctx.fillText(labels[li],W/2,s.cy+s.len*.38);
  raf=requestAnimationFrame(loop);
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(raf);else loop();});
loop();
})();
