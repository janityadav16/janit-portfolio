document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') {
    console.warn('GSAP not loaded.');
    return;
  }

  const transitionContainer = document.querySelector('.mythic-transition');
  const voidBg = document.querySelector('.void-bg');
  const runeCircle = document.querySelector('.rune-circle');
  const portal = document.querySelector('.eclipse-portal');
  const canvas = document.getElementById('mythic-canvas');
  
  if (!transitionContainer || !canvas) return;

  const ctx = canvas.getContext('2d');
  
  const runes = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Dynamically calculate radius and font sizes to fit any screen aspect ratio/size perfectly
    const radius = Math.min(window.innerWidth * 0.35, window.innerHeight * 0.35, 300);
    const fontSize = Math.min(24, Math.max(12, radius * 0.08));
    
    runes.forEach(rune => {
      rune.el.style.left = `calc(50% + ${Math.cos(rune.angle) * radius}px - ${fontSize / 2}px)`;
      rune.el.style.top = `calc(50% + ${Math.sin(rune.angle) * radius}px - ${fontSize / 2}px)`;
      rune.el.style.fontSize = `${fontSize}px`;
    });
  }
  window.addEventListener('resize', resizeCanvas);

  // Generate Runes
  if(runeCircle) {
    const kanji = "神竜斬虚空影王魔刃次元界".split("");
    for(let i=0; i<12; i++) {
      const r = document.createElement('div');
      r.className = 'rune';
      r.textContent = kanji[Math.floor(Math.random()*kanji.length)];
      const angle = (i / 12) * Math.PI * 2;
      r.style.transform = `rotate(${angle + Math.PI/2}rad)`;
      runeCircle.appendChild(r);
      runes.push({ el: r, angle: angle });
    }
  }

  resizeCanvas();

  // Draw the Katana Slash on canvas
  function drawSlash(progress) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(progress <= 0) return;
    
    const w = canvas.width;
    const h = canvas.height;
    const startX = w * 0.1; const startY = h * 0.9;
    const endX = w * 0.9; const endY = h * 0.1;
    
    const currX = startX + (endX - startX) * progress;
    const currY = startY + (endY - startY) * progress;

    // Glowing Slash
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 20;
    ctx.stroke();

    // Secondary energy
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.stroke();
  }

  // Initial Load Animation (Collapse Portal)
  // Check if we just navigated
  const isNavigating = sessionStorage.getItem('mythic_nav') === 'true';
  if (isNavigating) {
    sessionStorage.removeItem('mythic_nav');
    transitionContainer.style.pointerEvents = 'all';
    
    gsap.set(portal, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" });
    gsap.set(voidBg, { opacity: 1 });
    if(runeCircle) gsap.set(runeCircle, { opacity: 0, scale: 1.5 });

    const tl = gsap.timeline({
      onComplete: () => {
        transitionContainer.style.pointerEvents = 'none';
      }
    });

    tl.to(portal, { clipPath: "polygon(0% 50%, 100% 50%, 100% 50%, 0% 50%)", duration: 0.4, ease: "power4.in" })
      .to(voidBg, { opacity: 0, duration: 0.3 }, "-=0.2")
      .set(portal, { clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)" });

  } else {
    // Normal initial load, just hide
    gsap.set(portal, { clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)" });
  }

  // Intercept Navigation
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = link.getAttribute('href');
      // Prevent running if it's an anchor hash on the same page
      if(!target || target.startsWith('#')) return;
      
      e.preventDefault();
      transitionContainer.style.pointerEvents = 'all';
      
      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem('mythic_nav', 'true');
          window.location.href = target;
        }
      });

      // 1. Fast Awakening & Slash
      tl.to(voidBg, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" })
        .to({p: 0}, {
          p: 1, 
          duration: 0.3, 
          ease: "power4.in",
          onUpdate: function() { drawSlash(this.targets()[0].p); }
        }, "-=0.1");

      if(runeCircle) {
        tl.to(runeCircle, { opacity: 1, scale: 1, rotation: 90, duration: 0.3, ease: "power2.out" }, "-=0.3");
      }

      // 2. Dimensional Tear
      tl.set(portal, { clipPath: "polygon(0% 90%, 10% 100%, 90% 10%, 100% 0%)" })
        .to(portal, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 0.4, ease: "expo.inOut" });

    });
  });
});
