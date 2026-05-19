(function(){
'use strict';

const canvas = document.getElementById('neural-hud-canvas');
if(!canvas) return;
const ctx = canvas.getContext('2d');
let W, H;
function resize(){
  const rect = canvas.parentElement.getBoundingClientRect();
  W = canvas.width = rect.width;
  H = canvas.height = rect.height;
}
window.addEventListener('resize', resize, {passive:true});
resize();

// UI Elements
const tt = document.getElementById('neural-tooltip');
const hudNodes = document.getElementById('hud-nodes');
const hudSynapses = document.getElementById('hud-synapses');
const hudActivity = document.getElementById('hud-activity');
const hudSignal = document.getElementById('hud-signal');

// Configuration
const COLORS = {
  core: { hex: '#ffffff', r:255, g:255, b:255 },
  frontend: { hex: '#4dd2ff', r:77, g:210, b:255 }, // Cyan
  ai: { hex: '#b300ff', r:179, g:0, b:255 },      // Purple
  project: { hex: '#22c55e', r:34, g:197, b:94 }   // Green
};

const NODE_DEFS = [
  // CORE
  { id: 'core', label: 'JANIT.exe', group: 'core', size: 25, xPct: 0.5, yPct: 0.5, stat: 'SYSTEM CORE' },
  // FRONTEND (Cyan)
  { id: 'react', label: 'React', group: 'frontend', size: 15, xPct: 0.2, yPct: 0.2, stat: 'Proficiency: 90%', icon: 'react/react-original.svg' },
  { id: 'ts', label: 'TypeScript', group: 'frontend', size: 14, xPct: 0.35, yPct: 0.15, stat: 'Proficiency: 80%', icon: 'typescript/typescript-original.svg' },
  { id: 'tw', label: 'Tailwind', group: 'frontend', size: 14, xPct: 0.15, yPct: 0.4, stat: 'Proficiency: 80%', icon: 'tailwindcss/tailwindcss-original.svg' },
  { id: 'node', label: 'Node.js', group: 'frontend', size: 16, xPct: 0.3, yPct: 0.3, stat: 'Proficiency: 80%', icon: 'nodejs/nodejs-original.svg' },
  { id: 'sql', label: 'SQL', group: 'frontend', size: 12, xPct: 0.15, yPct: 0.6, stat: 'Proficiency: 75%', icon: 'azuresqldatabase/azuresqldatabase-original.svg' },
  { id: 'rest', label: 'REST APIs', group: 'frontend', size: 12, xPct: 0.25, yPct: 0.75, stat: 'Proficiency: 85%', icon: 'networkx/networkx-original.svg' },
  { id: 'python', label: 'Python', group: 'frontend', size: 18, xPct: 0.4, yPct: 0.8, stat: 'Proficiency: 90%', icon: 'python/python-original.svg' },
  // AI (Purple)
  { id: 'dl', label: 'Deep Learning', group: 'ai', size: 18, xPct: 0.7, yPct: 0.2, stat: 'Proficiency: 85%', icon: 'tensorflow/tensorflow-original.svg' },
  { id: 'cnn', label: 'CNN', group: 'ai', size: 15, xPct: 0.85, yPct: 0.3, stat: 'Proficiency: 85%', icon: 'pytorch/pytorch-original.svg' },
  { id: 'cv', label: 'Comp Vision', group: 'ai', size: 16, xPct: 0.75, yPct: 0.5, stat: 'Proficiency: 80%', icon: 'numpy/numpy-original.svg' },
  { id: 'opencv', label: 'OpenCV', group: 'ai', size: 15, xPct: 0.8, yPct: 0.7, stat: 'Proficiency: 80%', icon: 'opencv/opencv-original.svg' },
  // PROJECTS (Green)
  { id: 'leaf', label: 'LeafLens', group: 'project', size: 20, xPct: 0.65, yPct: 0.85, stat: 'Status: Deployed', textIcon: 'LL' },
  { id: 'obj', label: 'Obj Detect', group: 'project', size: 20, xPct: 0.85, yPct: 0.85, stat: 'Status: Live', textIcon: 'OD' }
];

const nodes = [];
const edges = [];
let signals = [];

// Load Image Helper
function loadIcon(path) {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${path}`;
  return img;
}

// Initialize Nodes
NODE_DEFS.forEach(def => {
  const n = {
    ...def,
    x: def.xPct * W,
    y: def.yPct * H,
    baseSize: def.size,
    color: COLORS[def.group],
    img: def.icon ? loadIcon(def.icon) : null,
    glow: 0,
    hovered: false
  };
  nodes.push(n);
});

// Initialize Edges (Connect everything to core, plus some interconnects)
const coreNode = nodes.find(n => n.id === 'core');
nodes.forEach(n => {
  if (n.id !== 'core') {
    edges.push({ a: n, b: coreNode });
    // Randomly connect some neighbors
    nodes.forEach(n2 => {
      if(n.id !== n2.id && n2.id !== 'core' && n.group === n2.group) {
        if(Math.random() > 0.6) edges.push({ a: n, b: n2 });
      }
    });
  }
});

// Deduplicate edges
const uniqueEdges = [];
edges.forEach(e => {
  if(!uniqueEdges.find(ue => (ue.a===e.a && ue.b===e.b) || (ue.a===e.b && ue.b===e.a))) {
    uniqueEdges.push(e);
  }
});

if(hudNodes) hudNodes.textContent = nodes.length;
if(hudSynapses) hudSynapses.textContent = uniqueEdges.length;

// Signal Particle System
class Signal {
  constructor(start, end, color) {
    this.start = start; this.end = end;
    this.color = color;
    this.progress = 0;
    this.speed = 0.005 + Math.random() * 0.01;
  }
  update() { this.progress += this.speed; }
  draw(ctx) {
    const x = this.start.x + (this.end.x - this.start.x) * this.progress;
    const y = this.start.y + (this.end.y - this.start.y) * this.progress;
    ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI*2);
    ctx.fillStyle = this.color.hex; ctx.shadowColor = this.color.hex;
    ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;
  }
}

// Interaction
let mouseX = -1000, mouseY = -1000;
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mouseX = e.clientX - r.left; mouseY = e.clientY - r.top;
});
canvas.addEventListener('mouseleave', () => { mouseX = -1000; mouseY = -1000; });

canvas.addEventListener('click', () => {
  nodes.forEach(n => {
    if(n.hovered) {
      if(hudSignal) hudSignal.textContent = 'BURST';
      setTimeout(() => { if(hudSignal) hudSignal.textContent = 'STABLE'; }, 1000);
      uniqueEdges.forEach(e => {
        if(e.a === n || e.b === n) {
          signals.push(new Signal(e.a === n ? e.a : e.b, e.a === n ? e.b : e.a, n.color));
          signals.push(new Signal(e.a === n ? e.b : e.a, e.a === n ? e.a : e.b, n.color));
        }
      });
    }
  });
});

let t = 0;
function render() {
  ctx.clearRect(0, 0, W, H);
  t += 0.05;

  // Background Grid (subtle)
  ctx.strokeStyle = 'rgba(77,210,255,0.02)';
  ctx.lineWidth = 1;
  for(let i=0; i<W; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,H); ctx.stroke(); }
  for(let i=0; i<H; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(W,i); ctx.stroke(); }

  let activeHover = null;
  let networkActivity = 0;

  // Update logic
  nodes.forEach(n => {
    // Breathing physics
    n.x = (n.xPct * W) + Math.sin(t * 0.5 + n.baseSize) * 5;
    n.y = (n.yPct * H) + Math.cos(t * 0.6 + n.baseSize) * 5;

    const dx = mouseX - n.x; const dy = mouseY - n.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    n.hovered = dist < n.baseSize * 2;
    if(n.hovered) activeHover = n;

    // Smooth glow transition
    const targetGlow = n.hovered ? 1 : 0;
    n.glow += (targetGlow - n.glow) * 0.2;
  });

  // Tooltip
  if(activeHover && tt) {
    tt.classList.add('active');
    tt.style.left = activeHover.x + 'px';
    tt.style.top = activeHover.y + 'px';
    tt.innerHTML = `<div class="tt-title" style="color:${activeHover.color.hex}">${activeHover.label}</div><div class="tt-stat">${activeHover.stat}</div>`;
  } else if(tt) {
    tt.classList.remove('active');
  }

  // Draw Edges
  uniqueEdges.forEach(e => {
    ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y);
    const alpha = 0.15 + (e.a.glow * 0.3) + (e.b.glow * 0.3);
    ctx.strokeStyle = `rgba(${e.a.color.r},${e.a.color.g},${e.a.color.b},${alpha})`;
    ctx.lineWidth = 1; ctx.stroke();
  });

  // Spontaneous Signals
  if(Math.random() > 0.95 && signals.length < 10) {
    const randEdge = uniqueEdges[Math.floor(Math.random() * uniqueEdges.length)];
    const startNode = Math.random() > 0.5 ? randEdge.a : randEdge.b;
    const endNode = startNode === randEdge.a ? randEdge.b : randEdge.a;
    signals.push(new Signal(startNode, endNode, startNode.color));
    networkActivity += 1;
  }

  // Update & Draw Signals
  for(let i=signals.length-1; i>=0; i--) {
    signals[i].update(); signals[i].draw(ctx);
    if(signals[i].progress >= 1) signals.splice(i, 1);
  }
  
  if(hudActivity) {
    if(signals.length > 8) hudActivity.textContent = 'HIGH';
    else if(signals.length > 4) hudActivity.textContent = 'ACTIVE';
    else hudActivity.textContent = 'NOMINAL';
  }

  // Draw Nodes
  nodes.forEach(n => {
    const s = n.baseSize + (n.glow * 5) + (n.id==='core' ? Math.sin(t)*2 : 0);
    ctx.beginPath(); ctx.arc(n.x, n.y, s, 0, Math.PI*2);
    ctx.fillStyle = `rgba(5,8,15,0.8)`;
    ctx.fill();
    
    ctx.strokeStyle = n.color.hex;
    ctx.lineWidth = 1.5 + (n.glow * 1);
    ctx.shadowColor = n.color.hex;
    ctx.shadowBlur = 5 + (n.glow * 15);
    ctx.stroke(); ctx.shadowBlur = 0;

    // Draw Icon or Text
    if(n.img && n.img.complete) {
      const imgSize = s * 1.2;
      ctx.drawImage(n.img, n.x - imgSize/2, n.y - imgSize/2, imgSize, imgSize);
    } else {
      ctx.fillStyle = n.color.hex;
      ctx.font = `bold ${s*0.8}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const text = n.textIcon || (n.id === 'core' ? 'JY' : n.label.substring(0,2).toUpperCase());
      ctx.fillText(text, n.x, n.y);
    }
  });

  requestAnimationFrame(render);
}
render();
})();
