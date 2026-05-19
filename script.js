'use strict';

/* ── SCROLL PROGRESS ── */
window.addEventListener('scroll', () => {
  const p = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
  const bar = document.querySelector('.scroll-progress');
  if(bar) bar.style.width = (p * 100) + '%';
}, {passive:true});

/* ── MOBILE MENU ── */
function closeMobile() {
  const m = document.getElementById('mobileMenu');
  if(m) m.classList.remove('open');
}
document.addEventListener('DOMContentLoaded', () => {
  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('mobileMenu');
  const cls = document.getElementById('mobileClose');
  if(ham && mob) ham.addEventListener('click', () => mob.classList.toggle('open'));
  if(cls) cls.addEventListener('click', closeMobile);

  /* ── ACTIVE NAV ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  function updateNav() {
    let cur = '';
    sections.forEach(s => { if(window.scrollY >= s.offsetTop - 100) cur = s.id; });
    navLinks.forEach(a => {
      a.classList.remove('active');
      if(a.getAttribute('href') === '#' + cur) a.classList.add('active');
    });
  }
  window.addEventListener('scroll', updateNav, {passive:true});

  /* ── REVEAL ON SCROLL (IntersectionObserver) ── */
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('section, .section').forEach(section => {
    if (section.closest('nav') || section.id === 'forgeCanvas' || section.id === 'mythic-canvas') return;

    section.classList.add('reveal-section');

    const animItems = [];
    const container = section.querySelector('.container');
    const parentForChildren = container || section;

    if (section.id === 'hero') {
      const heroLeft = section.querySelector('#heroContent') || section.querySelector('.hero-left');
      const heroRight = section.querySelector('.hero-right');
      if (heroLeft) {
        Array.from(heroLeft.children).forEach(child => animItems.push(child));
      }
      if (heroRight) {
        Array.from(heroRight.children).forEach(child => animItems.push(child));
      }
    } else {
      Array.from(parentForChildren.children).forEach(child => {
        if (child.classList.contains('projects-grid') || 
            child.classList.contains('about-grid') || 
            child.classList.contains('stat-cards') ||
            child.id === 'arsenalGrid' ||
            child.classList.contains('contact-main-grid') ||
            child.classList.contains('social-grid')) {
          
          const cards = child.querySelectorAll('.project-card, .skill-card, .stat-card, .social-card, .contact-form-card, .about-canvas-wrap, .spec-sheet');
          cards.forEach(card => animItems.push(card));
        } else {
          animItems.push(child);
        }
      });
    }

    animItems.forEach((item, idx) => {
      item.classList.add('reveal-item');
      item.style.transitionDelay = `${idx * 80}ms`;
    });

    revealObserver.observe(section);
  });

  /* ── GLITCH TEXT (TreeWalker — preserves inner <span> tags) ── */
  const glitchChars = '0123456789ABCDEF!@#$%';
  function glitchText(el) {
    const textNodes = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node;
    while((node = walker.nextNode())) textNodes.push(node);
    textNodes.forEach(tn => {
      const original = tn.textContent;
      if(!original.trim()) return;
      let iter = 0;
      const id = setInterval(() => {
        tn.textContent = original.split('').map((c, i) => {
          if(c === ' ') return ' ';
          if(i < iter) return original[i];
          return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }).join('');
        iter += 0.5;
        if(iter >= original.length) { tn.textContent = original; clearInterval(id); }
      }, 28);
    });
  }

  /* Apply glitch on hover only */
  document.querySelectorAll('.section-heading, .project-title').forEach(el => {
    el.addEventListener('mouseenter', () => glitchText(el));
  });

  /* Page title glitch on load */
  const pt = document.getElementById('pageTitle');
  if(pt) setTimeout(() => glitchText(pt), 500);

  /* ── MOUSE GLOW ON CARDS ── */
  document.querySelectorAll('.mouse-glow-target').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', (e.clientX - r.left) + 'px');
      card.style.setProperty('--mouse-y', (e.clientY - r.top) + 'px');
    });
  });

  /* ── HERO SCROLL NARRATIVE REMOVED ── */
  /* ── CHAR COUNT ── */
  const msg = document.getElementById('cfMsg');
  const cnt = document.getElementById('cfCount');
  if(msg && cnt) msg.addEventListener('input', () => cnt.textContent = msg.value.length);

  /* ── FORM INPUTS ── */
  document.querySelectorAll('.cf-group').forEach(g => {
    const input = g.querySelector('.cf-input');
    if(!input) return;
    input.addEventListener('focus', () => g.classList.add('focused'));
    input.addEventListener('blur', () => g.classList.remove('focused'));
  });

  const sub = document.getElementById('cfSubmit');
  if(sub) {
    sub.addEventListener('click', async () => {
      const nameEl = document.getElementById('cfName');
      const emailEl = document.getElementById('cfEmail');
      const msgEl = document.getElementById('cfMsg');
      
      if(!nameEl || !emailEl || !msgEl) return;
      
      const name = nameEl.value.trim();
      const email = emailEl.value.trim();
      const message = msgEl.value.trim();
      
      // Reset styles
      [nameEl, emailEl, msgEl].forEach(el => el.style.borderColor = '');
      
      // Simple validation
      if(!name || !email || !message) {
        if(!name) nameEl.style.borderColor = 'var(--color-red)';
        if(!email) emailEl.style.borderColor = 'var(--color-red)';
        if(!message) msgEl.style.borderColor = 'var(--color-red)';
        
        sub.textContent = 'ERROR: FILL FIELDS ✕';
        sub.style.background = 'var(--color-red)';
        setTimeout(() => { sub.textContent = 'SEND MESSAGE →'; sub.style.background = ''; }, 2500);
        return;
      }
      
      // Email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!emailRegex.test(email)) {
        emailEl.style.borderColor = 'var(--color-red)';
        sub.textContent = 'ERROR: INVALID EMAIL ✕';
        sub.style.background = 'var(--color-red)';
        setTimeout(() => { sub.textContent = 'SEND MESSAGE →'; sub.style.background = ''; }, 2500);
        return;
      }
      
      sub.textContent = 'TRANSMITTING...';
      sub.style.background = 'var(--color-blue)';
      sub.disabled = true;
      
      try {
        const response = await fetch('https://formsubmit.co/ajax/janityadav16@gmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name: name,
            email: email,
            message: message,
            _subject: 'New Portfolio Message from ' + name
          })
        });
        
        if(response.ok) {
          sub.textContent = 'TRANSMITTED ✓';
          sub.style.background = 'var(--color-green)';
          nameEl.value = '';
          emailEl.value = '';
          msgEl.value = '';
          const cnt = document.getElementById('cfCount');
          if(cnt) cnt.textContent = '0';
        } else {
          throw new Error('Submission failed');
        }
      } catch(err) {
        console.error(err);
        sub.textContent = 'TRANSMISSION FAILED ✕';
        sub.style.background = 'var(--color-red)';
      } finally {
        setTimeout(() => {
          sub.textContent = 'SEND MESSAGE →';
          sub.style.background = '';
          sub.disabled = false;
        }, 3000);
      }
    });
  }

  /* ── ARSENAL GRID — INDIVIDUAL SKILL CARDS ── */
  const skillColors = ['var(--color-blue)','var(--color-purple)','var(--color-green)','var(--color-yellow)','var(--color-red)'];
  let colorIdx = 0;

  const flatSkills = [
    {n:'React', l:90, icon:'react/react-original.svg'},
    {n:'TypeScript', l:80, icon:'typescript/typescript-original.svg'},
    {n:'JavaScript', l:90, icon:'javascript/javascript-original.svg'},
    {n:'Tailwind', l:80, icon:'tailwindcss/tailwindcss-original.svg'},
    {n:'HTML5/CSS3', l:95, icon:'html5/html5-original.svg'},
    {n:'Python', l:90, icon:'python/python-original.svg'},
    {n:'Node.js', l:80, icon:'nodejs/nodejs-original.svg'},
    {n:'Flask', l:85, icon:'flask/flask-original.svg'},
    {n:'SQL', l:75, icon:'azuresqldatabase/azuresqldatabase-original.svg'},
    {n:'Deep Learning', l:85, icon:'tensorflow/tensorflow-original.svg'},
    {n:'CNN', l:85, icon:'pytorch/pytorch-original.svg'},
    {n:'OpenCV', l:80, icon:'opencv/opencv-original.svg'}
  ];

  const grid = document.getElementById('arsenalGrid');
  if(grid) {
    grid.innerHTML = flatSkills.map(s => {
      const cardColor = skillColors[colorIdx++ % skillColors.length];
      const iconUrl = s.icon ? `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${s.icon}` : '';
      
      return `
      <div class="skill-card mouse-glow-target" style="--card-color:${cardColor}">
        <div class="skill-card-top">
          <span class="skill-card-name">${s.n}</span>
          ${iconUrl ? `<img src="${iconUrl}" class="skill-card-logo">` : ''}
        </div>
        <div class="arsenal-skill-row" data-level="${s.l}" data-color="${cardColor}">
          <div class="skill-row-top">
            <span class="skill-pct-label">${s.l}%</span>
          </div>
          <div class="skill-bar-wrap">
            ${Array.from({length:10}, (_, i) => `<div class="skill-bar-seg" style="--seg-color:${cardColor}"></div>`).join('')}
          </div>
        </div>
        ${iconUrl ? `<img src="${iconUrl}" class="skill-card-bg-icon">` : ''}
      </div>
      `;
    }).join('');

    /* Animate segments in */
    const cardObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(!e.isIntersecting) return;
        const row = e.target.querySelector('.arsenal-skill-row');
        if(row) {
          const level = parseInt(row.dataset.level);
          const color = row.dataset.color;
          const filled = Math.round(level / 10);
          row.querySelectorAll('.skill-bar-seg').forEach((seg, i) => {
            if(i < filled) {
              setTimeout(() => {
                seg.classList.add('filled');
                seg.style.background = color;
                seg.style.boxShadow = `0 0 4px ${color}`;
              }, i * 60);
            }
          });
        }
        cardObs.unobserve(e.target);
      });
    }, {threshold:0.2});
    grid.querySelectorAll('.skill-card').forEach(c => cardObs.observe(c));
  }

  /* ── LEARNING TYPEWRITER ── */
  const learningItems = ['Machine Learning Ops','Kubernetes','Next.js 15','LangChain','Rust'];
  let li = 0, lc = 0, lDir = 1;
  const lEl = document.getElementById('learningText');
  if(lEl) {
    setInterval(() => {
      if(lDir === 1) {
        lEl.textContent = learningItems[li].slice(0, lc++);
        if(lc > learningItems[li].length) lDir = -1;
      } else {
        lEl.textContent = learningItems[li].slice(0, lc--);
        if(lc < 0) { li = (li + 1) % learningItems.length; lDir = 1; lc = 0; }
      }
    }, 80);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FEATURE 1 — PAGE LOAD BOOT SEQUENCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const bootOverlay = document.getElementById('bootOverlay');
  const bootContent = document.getElementById('bootContent');
  const mainSite = document.querySelector('main');
  const navSite = document.querySelector('nav');

  const bootLinesDesktop = [
    { text: "> initializing portfolio_v3...", time: 0 },
    { text: "> loading modules: react · python · ai", time: 600 },
    { text: "> verifying identity: JANIT YADAV", time: 1200 },
    { text: "> CGPA: 8.62 / 10 ", time: 1800, check: true },
    { text: "> recutr.dev: LIVE ", time: 2400, check: true },
    { text: "> status: AVAILABLE — MAY 2026 ", time: 3000, check: true },
    { text: "> all systems online.", time: 3600 },
    { text: "> launching...", time: 4000 }
  ];

  const bootLinesMobile = [
    { text: "> initializing portfolio_v3...", time: 0 },
    { text: "> CGPA: 8.62 / 10 ", time: 600, check: true },
    { text: "> status: AVAILABLE — MAY 2026 ", time: 1200, check: true },
    { text: "> launching...", time: 1800 }
  ];

  const isMobile = window.innerWidth <= 768;
  const bootLines = isMobile ? bootLinesMobile : bootLinesDesktop;
  const totalBootTime = isMobile ? 2400 : 4600;

  if (bootOverlay && sessionStorage.getItem('booted') !== 'true') {
    if (mainSite) mainSite.style.opacity = '0';
    if (navSite) navSite.style.opacity = '0';
    document.body.style.overflow = 'hidden';

    const cursor = document.createElement('span');
    cursor.className = 'boot-cursor';

    bootLines.forEach(line => {
      setTimeout(() => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'boot-line';
        bootContent.appendChild(lineDiv);
        lineDiv.appendChild(cursor);

        let charIdx = 0;
        const typeInterval = setInterval(() => {
          if (charIdx < line.text.length) {
            cursor.before(line.text[charIdx]);
            charIdx++;
          } else {
            clearInterval(typeInterval);
            if (line.check) {
              const checkSpan = document.createElement('span');
              checkSpan.className = 'success-check';
              checkSpan.textContent = '✓';
              cursor.before(checkSpan);
            }
          }
        }, 15);
      }, line.time);
    });

    setTimeout(() => {
      bootOverlay.style.opacity = '0';
      if (mainSite) {
        mainSite.style.transition = 'opacity 0.6s ease';
        mainSite.style.opacity = '1';
      }
      if (navSite) {
        navSite.style.transition = 'opacity 0.6s ease';
        navSite.style.opacity = '1';
      }
      setTimeout(() => {
        bootOverlay.style.display = 'none';
        document.body.style.overflow = '';
        sessionStorage.setItem('booted', 'true');
      }, 600);
    }, totalBootTime);

  } else {
    if (bootOverlay) bootOverlay.style.display = 'none';
    if (mainSite) mainSite.style.opacity = '1';
    if (navSite) navSite.style.opacity = '1';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FEATURE 3 — CURRENTLY BUILDING TICKER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const tickerText = document.getElementById('tickerText');
  if (tickerText) {
    const tickerItems = [
      "Recutr v2 — AI feedback engine rewrite",
      "LangChain integration for dynamic question gen",
      "Portfolio v3 — always iterating"
    ];
    let tickerIdx = 0;
    setInterval(() => {
      tickerText.style.opacity = '0';
      setTimeout(() => {
        tickerIdx = (tickerIdx + 1) % tickerItems.length;
        tickerText.textContent = tickerItems[tickerIdx];
        tickerText.style.opacity = '1';
      }, 400);
    }, 3400);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FEATURE 4 — VERTICAL TIMELINE SECTION REVEALS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const timelineObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.timeline-item').forEach(item => {
    timelineObserver.observe(item);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FEATURE 5 — WORKING CONTACT FORM (FORMSPREE AJAX)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const contactForm = document.getElementById('contactForm');
  const cfSubmitBtn = document.getElementById('cfSubmitBtn');
  const formStatus = document.getElementById('formStatus');

  if (contactForm && cfSubmitBtn && formStatus) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      cfSubmitBtn.disabled = true;
      cfSubmitBtn.textContent = 'SENDING...';

      const formData = new FormData(contactForm);

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          contactForm.innerHTML = `
            <div class="form-status-msg" style="color: #4ade80;">
              <div>&gt; message transmitted successfully ✓</div>
              <div style="margin-top: 0.5rem;">&gt; i'll get back to you soon.</div>
            </div>
          `;
        } else {
          throw new Error('Formspree submission failed');
        }
      } catch (err) {
        console.error(err);
        formStatus.style.display = 'block';
        formStatus.style.color = '#ef4444';
        formStatus.textContent = '! transmission failed — try again';
        
        setTimeout(() => {
          cfSubmitBtn.disabled = false;
          cfSubmitBtn.textContent = 'SEND MESSAGE';
          formStatus.style.display = 'none';
        }, 3000);
      }
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FEATURE 6 — CURSOR TRAIL EFFECT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const trailCanvas = document.getElementById('trailCanvas');
  if (trailCanvas && !isMobile) {
    const tCtx = trailCanvas.getContext('2d');
    let particles = [];

    function resizeTrailCanvas() {
      trailCanvas.width = window.innerWidth;
      trailCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeTrailCanvas, { passive: true });
    resizeTrailCanvas();

    window.addEventListener('mousemove', (e) => {
      if (particles.length >= 25) {
        particles.shift();
      }
      particles.push({
        x: e.clientX,
        y: e.clientY,
        radius: 2 + Math.random() * 2,
        maxLife: 400,
        spawnTime: Date.now(),
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8
      });
    }, { passive: true });

    function drawTrail() {
      tCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      const now = Date.now();

      particles = particles.filter(p => {
        const elapsed = now - p.spawnTime;
        if (elapsed >= p.maxLife) return false;

        const ratio = elapsed / p.maxLife;
        const radius = p.radius * (1 - ratio);
        const opacity = 0.6 * (1 - ratio);

        p.x += p.vx;
        p.y += p.vy;

        tCtx.fillStyle = `rgba(91, 110, 245, ${opacity})`;
        tCtx.beginPath();
        tCtx.arc(p.x, p.y, Math.max(0.1, radius), 0, Math.PI * 2);
        tCtx.fill();

        return true;
      });

      requestAnimationFrame(drawTrail);
    }
    drawTrail();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FEATURE 8 — KONAMI CODE EASTER EGG
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const konamiCode = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  let konamiIdx = 0;

  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'secret-modal-backdrop';
  modalBackdrop.id = 'secretModalBackdrop';
  modalBackdrop.innerHTML = `
    <div class="secret-modal" id="secretModal">
      <button class="secret-close-btn" id="secretCloseBtn">✕</button>
      <div id="secretTerminal"></div>
    </div>
  `;
  document.body.appendChild(modalBackdrop);

  const secretTerminal = document.getElementById('secretTerminal');
  const secretCloseBtn = document.getElementById('secretCloseBtn');

  function closeSecretModal() {
    modalBackdrop.classList.remove('show');
  }

  if (secretCloseBtn) {
    secretCloseBtn.addEventListener('click', closeSecretModal);
  }
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeSecretModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSecretModal();
  });

  const modalLines = [
    { text: "> ACCESS GRANTED", className: "success" },
    { text: "> WELCOME TO THE SECRET TERMINAL", className: "accent" },
    { text: "" },
    { text: "> JANIT YADAV — FULL STACK & AI DEV" },
    { text: "> CGPA: 8.62 / 10" },
    { text: "> PROJECTS SHIPPED: 3" },
    { text: "> STATUS: AVAILABLE MAY 2026" },
    { text: "" },
    { text: "> QUICK LINKS:", className: "accent" },
    { text: "  [1] github.com/janityadav16", link: "https://github.com/janityadav16" },
    { text: "  [2] recutr.dev", link: "https://recutr.dev" },
    { text: "  [3] download resume", download: "resume.pdf" },
    { text: "" },
    { text: "> press ESC or click outside to exit" }
  ];

  function runModalTypewriter() {
    secretTerminal.innerHTML = '';
    
    let lineIdx = 0;
    function typeNextLine() {
      if (lineIdx >= modalLines.length) return;
      const line = modalLines[lineIdx];
      const lineDiv = document.createElement('div');
      lineDiv.className = 'secret-terminal-line';
      if (line.className) lineDiv.classList.add(line.className);
      
      secretTerminal.appendChild(lineDiv);

      if (line.text === "") {
        lineDiv.innerHTML = "&nbsp;";
        lineIdx++;
        setTimeout(typeNextLine, 50);
        return;
      }

      if (line.link) {
        const a = document.createElement('a');
        a.href = line.link;
        a.target = "_blank";
        lineDiv.appendChild(a);
        
        let charIdx = 0;
        const interval = setInterval(() => {
          if (charIdx < line.text.length) {
            a.textContent += line.text[charIdx];
            charIdx++;
          } else {
            clearInterval(interval);
            lineIdx++;
            setTimeout(typeNextLine, 50);
          }
        }, 12);
      } else if (line.download) {
        const a = document.createElement('a');
        a.href = line.download;
        a.download = true;
        lineDiv.appendChild(a);
        
        let charIdx = 0;
        const interval = setInterval(() => {
          if (charIdx < line.text.length) {
            a.textContent += line.text[charIdx];
            charIdx++;
          } else {
            clearInterval(interval);
            lineIdx++;
            setTimeout(typeNextLine, 50);
          }
        }, 12);
      } else {
        let charIdx = 0;
        const interval = setInterval(() => {
          if (charIdx < line.text.length) {
            lineDiv.textContent += line.text[charIdx];
            charIdx++;
          } else {
            clearInterval(interval);
            lineIdx++;
            setTimeout(typeNextLine, 50);
          }
        }, 12);
      }
    }
    typeNextLine();
  }

  function triggerKonamiGlitch() {
    const originalBg = document.body.style.backgroundColor;
    
    setTimeout(() => { document.body.style.backgroundColor = '#0d0a20'; }, 0);
    setTimeout(() => { document.body.style.backgroundColor = '#080c14'; }, 80);
    setTimeout(() => { document.body.style.backgroundColor = '#0d0a20'; }, 160);
    setTimeout(() => { document.body.style.backgroundColor = '#080c14'; }, 240);
    setTimeout(() => { document.body.style.backgroundColor = '#0d0a20'; }, 320);
    
    setTimeout(() => {
      document.body.style.backgroundColor = originalBg;
      modalBackdrop.classList.add('show');
      runModalTypewriter();
    }, 400);
  }

  window.addEventListener('keydown', (e) => {
    const key = e.key;
    const expectedKey = konamiCode[konamiIdx];
    
    if (key.toLowerCase() === expectedKey.toLowerCase()) {
      konamiIdx++;
      if (konamiIdx === konamiCode.length) {
        konamiIdx = 0;
        triggerKonamiGlitch();
      }
    } else {
      konamiIdx = 0;
    }
  });

});
