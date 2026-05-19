(function(){
'use strict';
const canvas=document.getElementById('katanaCanvas');
if(!canvas)return;
const ctx=canvas.getContext('2d');
let W,H,t=0,mouse={x:0.5,y:0.5},scroll=0;

function resize(){W=canvas.width=canvas.offsetWidth;H=canvas.height=canvas.offsetHeight;}
window.addEventListener('resize',resize,{passive:true});resize();
document.addEventListener('mousemove',e=>{mouse.x=e.clientX/window.innerWidth;mouse.y=e.clientY/window.innerHeight;},{passive:true});
window.addEventListener('scroll',()=>{scroll=window.scrollY/(document.body.scrollHeight-window.innerHeight||1);},{passive:true});

const bp=[];
class BladeParticle{
  constructor(bx,by,a){
    const d=Math.random();
    this.x=bx+Math.cos(a)*d*H*0.35;this.y=by-Math.sin(a)*d*H*0.35;
    this.vx=(Math.random()-0.5)*0.8;this.vy=-(0.5+Math.random()*1.5);
    this.life=0.6+Math.random()*0.4;this.decay=0.02+Math.random()*0.02;
    this.size=0.5+Math.random()*2;    this.cyan=Math.random()>0.2;
  }
  update(){this.x+=this.vx;this.y+=this.vy;this.life-=this.decay;}
  draw(){
    ctx.fillStyle=this.cyan?`rgba(179,0,255,${this.life})`:`rgba(255,0,85,${this.life*0.6})`;
    ctx.beginPath();ctx.arc(this.x,this.y,this.size,0,Math.PI*2);ctx.fill();
  }
}

function draw(t){
  ctx.clearRect(0,0,W,H);
  const cx=W*0.5,cy=H*0.5,bL=Math.min(W*0.7,H*0.75);
  const angle=-Math.PI*0.12+(mouse.x-0.5)*0.25+scroll*0.3+Math.sin(t*0.6)*0.015;
  const bob=Math.sin(t*0.7)*6;
  const dx=Math.cos(angle),dy=-Math.sin(angle);
  const tipX=cx+dx*bL*0.55+(mouse.x-0.5)*20,tipY=cy+dy*bL*0.55+bob;
  const rootX=cx-dx*bL*0.45+(mouse.x-0.5)*10,rootY=cy-dy*bL*0.45+bob;
  const midX=(tipX+rootX)/2,midY=(tipY+rootY)/2;
  const px=-dy,py=dx;

  // Ambient aura
  const ep=0.03+Math.sin(t*1.2)*0.015;
  const aura=ctx.createRadialGradient(midX,midY,0,midX,midY,bL*0.6);
  aura.addColorStop(0,`rgba(179,0,255,${ep})`);aura.addColorStop(0.5,`rgba(179,0,255,${ep*0.3})`);aura.addColorStop(1,'transparent');
  ctx.fillStyle=aura;ctx.fillRect(0,0,W,H);

  // Outer glow
  ctx.beginPath();ctx.moveTo(tipX,tipY);ctx.lineTo(rootX+px*35,rootY+py*35);ctx.lineTo(rootX-px*35,rootY-py*35);ctx.closePath();
  const og=ctx.createLinearGradient(rootX,rootY,tipX,tipY);
  og.addColorStop(0,'rgba(179,0,255,0)');og.addColorStop(0.5,'rgba(179,0,255,0.1)');og.addColorStop(1,'rgba(220,150,255,0.06)');
  ctx.fillStyle=og;ctx.filter='blur(12px)';ctx.fill();ctx.filter='none';

  // Bright face
  ctx.beginPath();ctx.moveTo(tipX,tipY);ctx.lineTo(rootX+px*12,rootY+py*12);ctx.lineTo(rootX+px*4,rootY+py*4);ctx.closePath();
  const bf=ctx.createLinearGradient(rootX,rootY,tipX,tipY);
  bf.addColorStop(0,'rgba(180,200,240,0.95)');bf.addColorStop(0.4,'rgba(220,235,255,1)');bf.addColorStop(1,'rgba(100,140,210,0.7)');
  ctx.fillStyle=bf;ctx.fill();

  // Dark face
  ctx.beginPath();ctx.moveTo(tipX,tipY);ctx.lineTo(rootX-px*12,rootY-py*12);ctx.lineTo(rootX-px*4,rootY-py*4);ctx.closePath();
  const df=ctx.createLinearGradient(rootX,rootY,tipX,tipY);
  df.addColorStop(0,'rgba(50,80,140,0.9)');df.addColorStop(1,'rgba(30,60,120,0.6)');
  ctx.fillStyle=df;ctx.fill();

  // Energy channel
  const cp=0.6+Math.sin(t*1.8)*0.4,cL=bL*0.88;
  [['rgba(179,0,255,'+cp*0.25+')',8,20],['rgba(179,0,255,'+cp*0.9+')',2,15]].forEach(([sc,lw,sb])=>{
    ctx.beginPath();ctx.moveTo(tipX,tipY);ctx.lineTo(tipX-dx*cL,tipY-dy*cL);
    ctx.strokeStyle=sc;ctx.lineWidth=lw;ctx.lineCap='round';ctx.shadowColor='#b300ff';ctx.shadowBlur=sb;ctx.stroke();ctx.shadowBlur=0;
  });
  ctx.beginPath();ctx.moveTo(tipX,tipY);ctx.lineTo(tipX-dx*cL*0.6,tipY-dy*cL*0.6);
  ctx.strokeStyle=`rgba(230,200,255,${cp*0.7})`;ctx.lineWidth=0.8;ctx.stroke();

  // Pulse dot
  const pp=(Math.sin(t*2.5)+1)/2,px2=tipX-dx*cL*(1-pp)*0.85,py2=tipY-dy*cL*(1-pp)*0.85;
  const pg=ctx.createRadialGradient(px2,py2,0,px2,py2,14);
  pg.addColorStop(0,'rgba(255,255,255,0.9)');pg.addColorStop(0.3,'rgba(179,0,255,0.7)');pg.addColorStop(1,'transparent');
  ctx.beginPath();ctx.arc(px2,py2,14,0,Math.PI*2);ctx.fillStyle=pg;ctx.fill();

  // Shimmer
  const sp=(Math.sin(t*1.4+1.2)+1)/2,sx=rootX+dx*bL*sp*0.9,sy=rootY+dy*bL*sp*0.9;
  const sg=ctx.createLinearGradient(sx-px*6,sy-py*6,sx+px*6,sy+py*6);
  sg.addColorStop(0,'transparent');sg.addColorStop(0.5,'rgba(255,255,255,0.4)');sg.addColorStop(1,'transparent');
  ctx.beginPath();ctx.moveTo(sx-dx*30,sy-dy*30);ctx.lineTo(sx+dx*30,sy+dy*30);ctx.strokeStyle=sg;ctx.lineWidth=5;ctx.stroke();

  // Tip glow
  const tp=0.7+Math.sin(t*2)*0.3,tg2=ctx.createRadialGradient(tipX,tipY,0,tipX,tipY,20);
  tg2.addColorStop(0,`rgba(230,200,255,${tp})`);tg2.addColorStop(0.3,`rgba(179,0,255,${tp*0.6})`);tg2.addColorStop(1,'transparent');
  ctx.beginPath();ctx.arc(tipX,tipY,20,0,Math.PI*2);ctx.fillStyle=tg2;ctx.fill();

  // Tsuba
  const tsX=rootX+dx*bL*0.08,tsY=rootY+dy*bL*0.08,tsW=bL*0.12,tsH=10;
  ctx.save();ctx.translate(tsX,tsY);ctx.rotate(angle-Math.PI/2);
  const tsg=ctx.createLinearGradient(-tsW/2,0,tsW/2,0);
  tsg.addColorStop(0,'rgba(15,10,30,0.95)');tsg.addColorStop(0.3,'rgba(40,20,80,0.95)');
  tsg.addColorStop(0.5,`rgba(179,0,255,0.7)`);tsg.addColorStop(0.7,'rgba(40,20,80,0.95)');tsg.addColorStop(1,'rgba(15,10,30,0.95)');
  ctx.fillStyle=tsg;
  ctx.beginPath();ctx.moveTo(-tsW/2,0);ctx.lineTo(-tsW/2+6,-tsH);ctx.lineTo(tsW/2-6,-tsH);ctx.lineTo(tsW/2,0);ctx.lineTo(tsW/2-6,tsH);ctx.lineTo(-tsW/2+6,tsH);ctx.closePath();
  ctx.fill();ctx.strokeStyle=`rgba(179,0,255,${0.4+Math.sin(t)*0.2})`;ctx.lineWidth=1;ctx.stroke();
  [-tsW*0.35,tsW*0.35].forEach(gx=>{
    const ga=0.6+Math.sin(t*1.5)*0.4;ctx.beginPath();ctx.arc(gx,0,3,0,Math.PI*2);
    ctx.fillStyle=`rgba(179,0,255,${ga})`;ctx.shadowColor='#b300ff';ctx.shadowBlur=10;ctx.fill();ctx.shadowBlur=0;
  });
  ctx.restore();

  // Grip
  const gL=bL*0.22,gW=9,gEX=tsX-dx*gL,gEY=tsY-dy*gL;
  const gg=ctx.createLinearGradient(tsX+px*gW,tsY+py*gW,tsX-px*gW,tsY-py*gW);
  gg.addColorStop(0,'#050508');gg.addColorStop(0.4,'#12141e');gg.addColorStop(0.6,'#1a1c2e');gg.addColorStop(1,'#050508');
  ctx.beginPath();ctx.moveTo(tsX+px*gW*0.7,tsY+py*gW*0.7);ctx.lineTo(tsX-px*gW*0.7,tsY-py*gW*0.7);
  ctx.lineTo(gEX-px*gW*0.4,gEY-py*gW*0.4);ctx.lineTo(gEX+px*gW*0.4,gEY+py*gW*0.4);ctx.closePath();
  ctx.fillStyle=gg;ctx.fill();
  for(let i=0;i<9;i++){
    const prog=(i+0.5)/9,wx=tsX-dx*gL*prog,wy=tsY-dy*gL*prog;
    ctx.beginPath();ctx.moveTo(wx+px*gW*0.7,wy+py*gW*0.7);ctx.lineTo(wx-px*gW*0.7,wy-py*gW*0.7);
    ctx.strokeStyle=`rgba(179,0,255,${0.15+Math.sin(t*1.2+i*0.5)*0.08})`;ctx.lineWidth=1.5;ctx.stroke();
  }

  // Pommel & Void Charm
  const pmG=ctx.createRadialGradient(gEX-px*2,gEY-py*2,0,gEX,gEY,11);
  pmG.addColorStop(0,`rgba(179,0,255,${0.7+Math.sin(t*1.8)*0.3})`);pmG.addColorStop(0.5,'rgba(25,15,45,0.95)');pmG.addColorStop(1,'#050508');
  ctx.beginPath();ctx.arc(gEX,gEY,11,0,Math.PI*2);ctx.fillStyle=pmG;
  ctx.shadowColor='#b300ff';ctx.shadowBlur=18+Math.sin(t*1.8)*8;ctx.fill();ctx.shadowBlur=0;
  ctx.strokeStyle='rgba(179,0,255,0.5)';ctx.lineWidth=0.8;ctx.stroke();

  // Hanging Void Charm (Diamond)
  const charmY = gEY + 25 + Math.sin(t*2.5)*3;
  const charmX = gEX + px*5 + Math.cos(t*2)*2;
  // Chain
  ctx.beginPath();ctx.moveTo(gEX,gEY);ctx.lineTo(charmX,charmY);ctx.strokeStyle='rgba(150,150,150,0.5)';ctx.lineWidth=0.5;ctx.stroke();
  // Charm
  ctx.save(); ctx.translate(charmX, charmY); ctx.rotate(Math.sin(t*1.5)*0.1);
  ctx.fillStyle=`rgba(179,0,255,${0.8+Math.sin(t*3)*0.2})`; ctx.shadowColor='#b300ff'; ctx.shadowBlur=15;
  ctx.beginPath(); ctx.moveTo(0,-8); ctx.lineTo(4,0); ctx.lineTo(0,8); ctx.lineTo(-4,0); ctx.closePath(); ctx.fill();
  ctx.restore();

  // Blade particles
  if(Math.random()>0.6)bp.push(new BladeParticle(rootX,rootY,angle));
  for(let i=bp.length-1;i>=0;i--){bp[i].update();if(bp[i].life<=0)bp.splice(i,1);else bp[i].draw();}

  // HUD
  const ha=0.45+Math.sin(t*0.4)*0.1;
  ctx.font='500 9px "JetBrains Mono",monospace';ctx.fillStyle=`rgba(179,0,255,${ha})`;
  ctx.textAlign='left';
  ctx.fillText('VOID_ENERGY:'+(85+Math.sin(t)*8).toFixed(1)+'%',tipX+px*20+8,tipY+py*20);
  ctx.textAlign='right';
  ctx.fillText('VOID_REAPER // ACTIVE',gEX-px*15-8,gEY-py*15);
  ctx.fillText('ONI_PROTOCOL',gEX-px*15-8,gEY-py*15+14);
}

function loop(){t+=0.016;if(!document.hidden)draw(t);requestAnimationFrame(loop);}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)loop();});
loop();
})();
