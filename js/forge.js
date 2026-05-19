(function() {
  'use strict';

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CANVAS SETUP & LIFECYCLE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const canvas = document.getElementById('forgeCanvas') || document.createElement('canvas');
  if (!canvas.id) {
    canvas.id = 'forgeCanvas';
    canvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1; pointer-events: none;';
    document.body.prepend(canvas);
  }

  // Force body background to transparent so the z-index: -1 canvas is visible
  document.body.style.backgroundColor = 'transparent';
  document.body.style.backgroundImage = 'none';

  const ctx = canvas.getContext('2d');
  let W, H;
  let t = 0;
  let camZ = 0;

  // Mouse / Touch Interaction State
  let mouseX = 0;
  let mouseY = 0;
  let mouseActive = false;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initStars();
    initParticles();
  }

  window.addEventListener('resize', resize, { passive: true });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LAYER 1 — TWINKLING STARS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  class Star {
    constructor(w, h) {
      this.x = Math.random() * w;
      this.y = Math.random() * h * 0.65; // Upper 65%
      this.r = 0.4 + Math.random() * 1.0; // radius 0.4–1.4px
      this.phase = Math.random() * Math.PI * 2;
      this.speed = 0.003 + Math.random() * 0.009; // phase increment 0.003–0.012 per frame
    }
    update() {
      this.phase += this.speed;
    }
    draw(ctx) {
      // Alpha oscillates between 0.05 and 0.55
      const alpha = 0.30 + 0.25 * Math.sin(this.phase);
      ctx.fillStyle = `rgba(200, 215, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let stars = [];
  function initStars() {
    stars = [];
    for (let i = 0; i < 130; i++) {
      stars.push(new Star(W, H));
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LAYER 2 — AURORA ATMOSPHERE BANDS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const bands = [
    {
      color: '80,30,210',  // Band 1: rgb(80,30,210)
      baselineYPct: 0.38,  // baseline y at 38% of height
      freq1: 0.005,
      freq2: 0.009,
      speedMult: 0.25,
      amp1Pct: 0.05,
      amp2Pct: 0.03,
      opacity: 0.16
    },
    {
      color: '40,70,240',  // Band 2: rgb(40,70,240)
      baselineYPct: 0.46,  // baseline y at 46% of height
      freq1: 0.007,
      freq2: 0.012,
      speedMult: 0.38,
      amp1Pct: 0.045,
      amp2Pct: 0.025,
      opacity: 0.14
    },
    {
      color: '20,170,160', // Band 3: rgb(20,170,160)
      baselineYPct: 0.55,  // baseline y at 55% of height
      freq1: 0.004,
      freq2: 0.008,
      speedMult: 0.48,
      amp1Pct: 0.055,
      amp2Pct: 0.03,
      opacity: 0.18
    },
    {
      color: '110,40,200', // Band 4: rgb(110,40,200)
      baselineYPct: 0.30,  // baseline y at 30% of height
      freq1: 0.008,
      freq2: 0.014,
      speedMult: 0.20,
      amp1Pct: 0.04,
      amp2Pct: 0.02,
      opacity: 0.12
    }
  ];

  function drawAuroras() {
    bands.forEach(band => {
      const baselineY = H * band.baselineYPct;
      const amp1 = H * band.amp1Pct;
      const amp2 = H * band.amp2Pct;

      ctx.beginPath();
      
      // Calculate first point
      const startY = baselineY +
                     Math.sin(0 * band.freq1 + t * band.speedMult) * amp1 +
                     Math.sin(0 * band.freq2 + t * band.speedMult * 1.6) * amp2;
      ctx.moveTo(0, startY);

      for (let x = 4; x <= W; x += 4) {
        const y = baselineY +
                  Math.sin(x * band.freq1 + t * band.speedMult) * amp1 +
                  Math.sin(x * band.freq2 + t * band.speedMult * 1.6) * amp2;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();

      // Create vertical linear gradient
      const gradTop = Math.max(0, baselineY - amp1 - amp2);
      const grad = ctx.createLinearGradient(0, gradTop, 0, H);
      
      // Fills top: rgba(color, 0.10–0.20) → mid: rgba(color, 0.05) → bottom: transparent
      grad.addColorStop(0, `rgba(${band.color}, ${band.opacity})`);
      grad.addColorStop(0.5, `rgba(${band.color}, 0.05)`);
      grad.addColorStop(1, `rgba(${band.color}, 0)`);

      ctx.fillStyle = grad;
      ctx.fill();
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LAYER 3 — PERSPECTIVE GRID (FLOOR)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  function drawGrid() {
    const horizonY = H * 0.70; // Horizon sits at 70% of canvas height
    const vanishingX = W * 0.5; // Vanishing point at center (50% x, 70% y)

    // Horizon Glow
    ctx.save();
    const glowGrad = ctx.createRadialGradient(vanishingX, horizonY, 0, vanishingX, horizonY, 320);
    glowGrad.addColorStop(0, 'rgba(91, 110, 245, 0.18)');
    glowGrad.addColorStop(0.5, 'rgba(100, 50, 220, 0.06)');
    glowGrad.addColorStop(1, 'rgba(91, 110, 245, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(vanishingX - 320, horizonY - 100, 640, 200);
    ctx.restore();

    // Clip below horizon
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, horizonY, W, H - horizonY);
    ctx.clip();

    ctx.lineWidth = 0.9;

    // Horizontal Lines (Z-axis rows) - 12 rows deep, grid spacing 80 units
    for (let i = 1; i <= 12; i++) {
      const zDepth = (i * 80) - (camZ % 80);
      if (zDepth <= 0) continue;

      const scale = horizonY / zDepth;
      const y = horizonY + scale * 20;

      if (y > H) continue;

      // Opacity fades from 0.55 (near horizon) to 0.08 (bottom)
      const ratio = (y - horizonY) / (H - horizonY);
      const clampedRatio = Math.max(0, Math.min(1, ratio));
      const opacity = 0.55 - clampedRatio * (0.55 - 0.08);

      ctx.strokeStyle = `rgba(91, 110, 245, ${opacity})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Vertical Lines (X-axis columns) - 22 columns wide converging to vanishing point
    const scaleAtBottom = (H - horizonY) / 20;
    for (let col = -11; col <= 11; col++) {
      const xBottom = vanishingX + (col * 80) * scaleAtBottom;
      const colRatio = Math.abs(col) / 11;
      const opacity = 0.55 - colRatio * (0.55 - 0.08);

      ctx.strokeStyle = `rgba(91, 110, 245, ${opacity})`;
      ctx.beginPath();
      ctx.moveTo(vanishingX, horizonY);
      ctx.lineTo(xBottom, H);
      ctx.stroke();
    }

    ctx.restore();

    // Horizon Line (4px tall gradient strip at y = horizon)
    ctx.save();
    const lineGrad = ctx.createLinearGradient(0, horizonY, W, horizonY);
    lineGrad.addColorStop(0, 'rgba(91, 110, 245, 0)');
    lineGrad.addColorStop(0.5, 'rgba(91, 110, 245, 0.55)');
    lineGrad.addColorStop(1, 'rgba(91, 110, 245, 0)');
    ctx.fillStyle = lineGrad;
    ctx.fillRect(0, horizonY - 2, W, 4);
    ctx.restore();

    // Scanlines (subtle CRT feel over full canvas height)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.025)';
    for (let y = 0; y < H; y += 4) {
      ctx.fillRect(0, y, W, 1.5);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LAYER 4 — INTERACTIVE PARTICLE WEB
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  class Particle {
    constructor(w, h) {
      this.x = Math.random() * w;
      // Concentrated upper 75%
      this.y = Math.random() < 0.8 ? Math.random() * h * 0.75 : h * 0.75 + Math.random() * h * 0.25;
      
      this.baseVx = (Math.random() - 0.5) * 0.4;
      this.baseVy = (Math.random() - 0.5) * 0.4;
      this.vx = this.baseVx;
      this.vy = this.baseVy;
      
      this.baseRadius = 0.8 + Math.random() * 1.4; // radius: 0.8–2.2px
      this.phase = Math.random() * Math.PI * 2;
    }
    update(w, h, mx, my, active) {
      this.phase += 0.02;

      // Mouse Attraction/Repulsion
      if (active) {
        const dx = this.x - mx;
        const dy = this.y - my;
        const dist = Math.hypot(dx, dy);
        if (dist < 180 && dist > 0) {
          // Repulsion force strength = (180 - distance) / 180 × 1.8
          const strength = ((180 - dist) / 180) * 1.8;
          this.vx += (dx / dist) * strength;
          this.vy += (dy / dist) * strength;
        }
      }

      // Velocity damping back to natural drift
      this.vx = this.vx * 0.94 + this.baseVx * 0.06;
      this.vy = this.vy * 0.94 + this.baseVy * 0.06;

      // Move & wrap around canvas edges
      this.x = (this.x + this.vx + w) % w;
      this.y = (this.y + this.vy + h) % h;
    }
    draw(ctx, mx, my, active) {
      // Pulse radius
      const radius = this.baseRadius + Math.sin(this.phase) * 0.3;

      // Base fill: rgba(91, 110, 245, 0.45–0.90) based on pulse
      const baseOpacity = 0.675 + 0.225 * Math.sin(this.phase);

      const dx = this.x - mx;
      const dy = this.y - my;
      const dist = Math.hypot(dx, dy);
      const isNearMouse = active && dist < 180;

      if (isNearMouse) {
        // Increase brightness for particles within 180px
        ctx.fillStyle = `rgba(160, 185, 255, ${Math.min(1.0, baseOpacity + 0.20)})`;
      } else {
        ctx.fillStyle = `rgba(91, 110, 245, ${baseOpacity})`;
      }

      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.4, radius), 0, Math.PI * 2);
      ctx.fill();

      // Soft glow ring for particles close to mouse
      if (isNearMouse) {
        const glowOpacity = 0.20 + 0.08 * ((Math.sin(this.phase) + 1) / 2);
        ctx.strokeStyle = `rgba(91, 110, 245, ${glowOpacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  let particles = [];
  function initParticles() {
    particles = [];
    for (let i = 0; i < 90; i++) {
      particles.push(new Particle(W, H));
    }
  }

  function drawParticleWeb() {
    // 1. Update and Draw Particles
    particles.forEach(p => {
      p.update(W, H, mouseX, mouseY, mouseActive);
      p.draw(ctx, mouseX, mouseY, mouseActive);
    });

    // 2. Connection lines: For every pair within 100px
    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 100) {
          // Opacity = (1 - distance/100) × 0.38
          const opacity = (1 - dist / 100) * 0.38;
          ctx.strokeStyle = `rgba(91, 110, 245, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    // 3. Mouse Ripple Rings (only when hovering)
    if (mouseActive) {
      ctx.lineWidth = 1;

      ctx.strokeStyle = 'rgba(91, 110, 245, 0.08)';
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 40, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(91, 110, 245, 0.05)';
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 80, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(91, 110, 245, 0.03)';
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 130, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LAYER 5 — VIGNETTE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  function drawVignette() {
    const cx = W * 0.5;
    const cy = H * 0.5;
    const innerR = H * 0.30;
    const outerR = H * 0.90;

    const vigGrad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(1, 'rgba(0,0,0,0.45)');

    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, W, H);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MOUSE & TOUCH EVENT LISTENERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseActive = true;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouseActive = false;
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    if (e.touches && e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      mouseActive = true;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouseActive = false;
  }, { passive: true });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN ANIMATION LOOP (60FPS)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  function loop() {
    if (document.hidden) {
      requestAnimationFrame(loop);
      return;
    }

    // Single clear with rgba(8,12,20,1) deep navy at START of each frame
    ctx.fillStyle = 'rgba(8, 12, 20, 1)';
    ctx.fillRect(0, 0, W, H);

    // Increment global variables
    t += 0.05;
    camZ += 0.8;

    // Render layers in order: bottom to top
    
    // Layer 1: Twinkling Stars
    stars.forEach(s => {
      s.update();
      s.draw(ctx);
    });

    // Layer 2: Aurora Atmosphere
    drawAuroras();

    // Layer 3: Perspective Grid (Floor)
    drawGrid();

    // Layer 4: Interactive Particle Web
    drawParticleWeb();

    // Layer 5: Vignette
    drawVignette();

    requestAnimationFrame(loop);
  }

  // Initial resize and start loop
  resize();
  loop();
})();
