(function(){
'use strict';
const canvases = document.querySelectorAll('#bladeCanvas, #bladeMini');
if(!canvases.length) return;
let mouse={x:0.5,y:0.5},scroll=0,t=0;
document.addEventListener('mousemove',e=>{mouse.x=e.clientX/window.innerWidth;mouse.y=e.clientY/window.innerHeight;},{passive:true});
window.addEventListener('scroll',()=>{scroll=window.scrollY/(document.body.scrollHeight-window.innerHeight||1);},{passive:true});

function drawBlade(canvas){
  const ctx=canvas.getContext('2d');
  const W=canvas.width=canvas.offsetWidth;
  const H=canvas.height=canvas.offsetHeight;
  ctx.clearRect(0,0,W,H);
  const cx=W*0.5,cy=H*0.5;
  const totalLen=Math.min(W,H)*0.65;
  const angle=(mouse.x-0.5)*0.3+scroll*0.4-0.2;
  const bobY=Math.sin(t*0.8)*8;
  const glowR=scroll<0.5?0:Math.floor((scroll-0.5)*2*255);
  const glowG=Math.floor(219*(1-scroll*0.3));
  const glowB=Math.floor(233*(1-scroll*0.2));
  const gc=`rgba(${glowR},${glowG},${glowB},`;
  ctx.save();
  ctx.translate(cx,cy+bobY);
  ctx.rotate(angle);
  const tip={x:0,y:-totalLen*0.62},root={x:0,y:totalLen*0.18};
  const auraG=ctx.createRadialGradient(0,-totalLen*0.3,0,0,-totalLen*0.3,totalLen*0.5);
  auraG.addColorStop(0,gc+'0.08)');auraG.addColorStop(1,'transparent');
  ctx.fillStyle=auraG;ctx.beginPath();ctx.ellipse(0,-totalLen*0.3,totalLen*0.4,totalLen*0.55,0,0,Math.PI*2);ctx.fill();
  const sW=8,rW=5.5;
  const lf=ctx.createLinearGradient(-sW,root.y,0,tip.y);
  lf.addColorStop(0,'rgba(200,215,255,0.95)');lf.addColorStop(0.3,'rgba(160,185,240,0.9)');lf.addColorStop(0.7,'rgba(120,150,220,0.8)');lf.addColorStop(1,'rgba(80,110,200,0.6)');
  ctx.beginPath();ctx.moveTo(tip.x,tip.y);ctx.lineTo(-sW,root.y*0.3);ctx.lineTo(-rW,root.y);ctx.closePath();ctx.fillStyle=lf;ctx.fill();
  const rf=ctx.createLinearGradient(sW,root.y,0,tip.y);
  rf.addColorStop(0,'rgba(100,130,200,0.85)');rf.addColorStop(0.4,'rgba(70,100,180,0.75)');rf.addColorStop(1,'rgba(40,70,160,0.5)');
  ctx.beginPath();ctx.moveTo(tip.x,tip.y);ctx.lineTo(sW,root.y*0.3);ctx.lineTo(rW,root.y);ctx.closePath();ctx.fillStyle=rf;ctx.fill();
  const fg=ctx.createLinearGradient(0,tip.y,0,root.y);
  fg.addColorStop(0,gc+'1)');fg.addColorStop(0.3,gc+'0.7)');fg.addColorStop(0.7,gc+'0.3)');fg.addColorStop(1,'transparent');
  ctx.beginPath();ctx.moveTo(0,tip.y+4);ctx.lineTo(1,root.y*0.4);ctx.lineTo(-1,root.y*0.4);ctx.closePath();ctx.fillStyle=fg;ctx.fill();
  ctx.beginPath();ctx.moveTo(-0.5,tip.y);ctx.lineTo(-sW+1,root.y*0.3);ctx.strokeStyle='rgba(220,230,255,0.6)';ctx.lineWidth=0.5;ctx.stroke();
  [{y1:tip.y+totalLen*0.15,xOff:1.5},{y1:tip.y+totalLen*0.30,xOff:2.5},{y1:tip.y+totalLen*0.48,xOff:3.5}].forEach((cl,i)=>{
    const pa=0.4+0.4*Math.sin(t*2+i*1.2);
    ctx.beginPath();ctx.moveTo(-cl.xOff,cl.y1);ctx.lineTo(cl.xOff,cl.y1);ctx.strokeStyle=gc+pa+')';ctx.lineWidth=0.8;ctx.shadowColor=`rgb(${glowR},${glowG},${glowB})`;ctx.shadowBlur=6;ctx.stroke();ctx.shadowBlur=0;
  });
  const sy=tip.y+(Math.sin(t*1.2)+1)/2*totalLen*0.75;
  const sg=ctx.createLinearGradient(0,sy-25,0,sy+25);
  sg.addColorStop(0,'transparent');sg.addColorStop(0.5,'rgba(255,255,255,0.35)');sg.addColorStop(1,'transparent');
  ctx.beginPath();ctx.moveTo(-3,sy-20);ctx.lineTo(0,sy-24);ctx.lineTo(3,sy-20);ctx.lineTo(3,sy+20);ctx.lineTo(0,sy+24);ctx.lineTo(-3,sy+20);ctx.closePath();ctx.fillStyle=sg;ctx.fill();
  const tg=ctx.createRadialGradient(tip.x,tip.y,0,tip.x,tip.y,18);
  tg.addColorStop(0,gc+'0.9)');tg.addColorStop(0.4,gc+'0.4)');tg.addColorStop(1,'transparent');
  ctx.beginPath();ctx.arc(tip.x,tip.y,18,0,Math.PI*2);ctx.fillStyle=tg;ctx.fill();
  const gW=totalLen*0.22,gH=8,gY=root.y*0.28;
  const gg=ctx.createLinearGradient(-gW/2,gY,gW/2,gY);
  gg.addColorStop(0,'rgba(30,40,70,0.9)');gg.addColorStop(0.25,'rgba(80,100,160,0.9)');gg.addColorStop(0.5,gc+'0.8)');gg.addColorStop(0.75,'rgba(80,100,160,0.9)');gg.addColorStop(1,'rgba(30,40,70,0.9)');
  ctx.fillStyle=gg;ctx.fillRect(-gW/2,gY-gH/2,gW,gH);
  ctx.strokeStyle=gc+'0.5)';ctx.lineWidth=0.5;ctx.strokeRect(-gW/2,gY-gH/2,gW,gH);
  ctx.beginPath();ctx.moveTo(-gW/2+4,gY);ctx.lineTo(gW/2-4,gY);ctx.strokeStyle=gc+'0.6)';ctx.lineWidth=1;ctx.shadowColor=`rgb(${glowR},${glowG},${glowB})`;ctx.shadowBlur=10;ctx.stroke();ctx.shadowBlur=0;
  [-gW/2+5,gW/2-5].forEach(gx=>{
    const gp=0.6+0.4*Math.sin(t*1.8);
    ctx.beginPath();ctx.arc(gx,gY,3.5,0,Math.PI*2);
    const gemG=ctx.createRadialGradient(gx-1,gY-1,0,gx,gY,3.5);gemG.addColorStop(0,gc+gp+')');gemG.addColorStop(1,gc+'0.1)');
    ctx.fillStyle=gemG;ctx.shadowColor=`rgb(${glowR},${glowG},${glowB})`;ctx.shadowBlur=12;ctx.fill();ctx.shadowBlur=0;
  });
  const gripH=totalLen*0.2,gripW=6,gripY=gY+gH/2;
  const grG=ctx.createLinearGradient(-gripW,gripY,gripW,gripY);
  grG.addColorStop(0,'#0d0d0d');grG.addColorStop(0.4,'#1a1a2e');grG.addColorStop(0.6,'#252535');grG.addColorStop(1,'#0d0d0d');
  ctx.fillStyle=grG;ctx.fillRect(-gripW/2,gripY,gripW,gripH);
  for(let i=0;i<8;i++){const wy=gripY+(i+0.5)*(gripH/8);ctx.beginPath();ctx.moveTo(-gripW/2,wy);ctx.lineTo(gripW/2,wy);ctx.strokeStyle=gc+(0.2+0.15*Math.sin(t+i*0.5))+')';ctx.lineWidth=1;ctx.stroke();}
  const py=gripY+gripH,pr=9;
  const pG=ctx.createRadialGradient(-2,py,0,0,py,pr);pG.addColorStop(0,gc+'0.8)');pG.addColorStop(0.4,'rgba(40,60,120,0.9)');pG.addColorStop(1,'#0d0d0d');
  ctx.beginPath();ctx.arc(0,py,pr,0,Math.PI*2);ctx.fillStyle=pG;ctx.fill();ctx.strokeStyle=gc+'0.4)';ctx.lineWidth=0.8;ctx.stroke();
  const pp=0.7+0.3*Math.sin(t*1.5);
  ctx.beginPath();ctx.arc(0,py,4,0,Math.PI*2);ctx.fillStyle=gc+pp+')';ctx.shadowColor=`rgb(${glowR},${glowG},${glowB})`;ctx.shadowBlur=16+8*Math.sin(t*1.5);ctx.fill();ctx.shadowBlur=0;
  if(canvas.id==='bladeCanvas'){
    const ha=0.5+0.1*Math.sin(t*0.5);
    ctx.font=`500 9px 'JetBrains Mono',monospace`;ctx.fillStyle=gc+ha+')';
    ctx.textAlign='right';ctx.fillText('SYS_OK',-gW/2-10,gY-15);ctx.fillText('DMG:'+(scroll*100).toFixed(0)+'%',-gW/2-10,gY+5);
    ctx.textAlign='left';ctx.fillText('UNIT_01',gW/2+10,gY-15);ctx.fillText('ACTIVE',gW/2+10,gY+5);
    const secs=['HERO','ABOUT','ARSENAL','PROJECTS','CONTACT'];
    ctx.textAlign='center';ctx.fillStyle=gc+'0.35)';ctx.font=`400 8px 'JetBrains Mono',monospace`;
    ctx.fillText('// '+secs[Math.min(4,Math.floor(scroll*5))],0,py+pr+14);
  }
  ctx.restore();
}

let trails=[];
document.addEventListener('click',e=>{
  const bc=document.getElementById('bladeCanvas');if(!bc)return;
  const r=bc.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right)return;
  trails.push({x:e.clientX-r.left,y:e.clientY-r.top,angle:-0.3+Math.random()*0.6,length:80+Math.random()*60,life:1});
},{passive:true});

function drawTrails(canvas){
  if(canvas.id!=='bladeCanvas')return;
  const ctx=canvas.getContext('2d');
  trails=trails.filter(tr=>tr.life>0);
  trails.forEach(tr=>{
    tr.life-=0.04;const a=tr.life;
    ctx.save();ctx.translate(tr.x,tr.y);ctx.rotate(tr.angle);
    const slG=ctx.createLinearGradient(-tr.length/2,0,tr.length/2,0);
    slG.addColorStop(0,'transparent');slG.addColorStop(0.4,`rgba(0,219,233,${a*0.8})`);slG.addColorStop(0.6,`rgba(255,255,255,${a})`);slG.addColorStop(1,'transparent');
    ctx.beginPath();ctx.moveTo(-tr.length/2,0);ctx.lineTo(tr.length/2,0);ctx.strokeStyle=slG;ctx.lineWidth=3;ctx.stroke();
    ctx.beginPath();ctx.moveTo(-tr.length/3,0);ctx.lineTo(tr.length/3,0);ctx.strokeStyle=`rgba(255,255,255,${a*0.9})`;ctx.lineWidth=0.8;ctx.stroke();
    ctx.restore();
  });
}

function loop(){
  t+=0.016;
  canvases.forEach(canvas=>{if(!canvas.offsetParent&&canvas.id!=='bladeCanvas')return;drawBlade(canvas);drawTrails(canvas);});
  requestAnimationFrame(loop);
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)loop();});
loop();
})();
