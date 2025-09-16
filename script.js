// -----------------------------
// script.js
// SPA nav, theme toggle, thought save, particle background (letters & numbers)
// -----------------------------

document.addEventListener('DOMContentLoaded', ()=>{

  /* ---------- UI selectors ---------- */
  const navButtons = document.querySelectorAll('.nav-btn');
  const panels = document.querySelectorAll('.panel');
  const menuToggle = document.getElementById('menuToggle');
  const yearEl = document.getElementById('year');

  const thoughtSlot = document.getElementById('thoughtSlot');
  const saveThoughtBtn = document.getElementById('saveThought');
  const clearThoughtBtn = document.getElementById('clearThought');

  const btnLight = document.getElementById('btnLight');
  const btnDark = document.getElementById('btnDark');

  /* ---------- YEAR ---------- */
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- NAV behavior (SPA-ish) ---------- */
  navButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = btn.dataset.target;
      navButtons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      panels.forEach(p=> p.classList.toggle('active', p.id===target));
      document.body.classList.remove('menu-open');
    });
  });

  if(menuToggle){
    menuToggle.addEventListener('click', ()=> document.body.classList.toggle('menu-open'));
  }

  /* ---------- Thought local save ---------- */
  const THOUGHT_KEY = 'myThought_v2';
  if(saveThoughtBtn){
    saveThoughtBtn.addEventListener('click', ()=>{
      const txt = (thoughtSlot && thoughtSlot.innerText || '').trim();
      if(!txt) return alert('Thought empty — write something first.');
      localStorage.setItem(THOUGHT_KEY, txt);
      saveThoughtBtn.textContent = 'Saved ✓';
      setTimeout(()=> saveThoughtBtn.textContent = 'Save locally', 1400);
    });
  }
  if(clearThoughtBtn){
    clearThoughtBtn.addEventListener('click', ()=>{
      if(confirm('Clear the thought box?')){
        if(thoughtSlot) thoughtSlot.innerText = '';
        localStorage.removeItem(THOUGHT_KEY);
      }
    });
  }
  const storedThought = localStorage.getItem(THOUGHT_KEY);
  if(storedThought && thoughtSlot) thoughtSlot.innerText = storedThought;

  /* ---------- Theme init / toggle ---------- */
  const THEME_KEY = 'siteTheme_v2';
  function applyTheme(theme){
    document.body.classList.remove('theme-dark','theme-light');
    if(theme === 'light') document.body.classList.add('theme-light');
    else document.body.classList.add('theme-dark');
  }
  let currentTheme = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(currentTheme);

  if(btnLight) btnLight.addEventListener('click', ()=>{
    applyTheme('light');
    localStorage.setItem(THEME_KEY,'light');
  });
  if(btnDark) btnDark.addEventListener('click', ()=>{
    applyTheme('dark');
    localStorage.setItem(THEME_KEY,'dark');
  });

  /* ---------- PARTICLE CANVAS: letters & numbers ---------- */
  const canvas = document.getElementById('bgCanvas');
  if(!canvas) return; // canvas missing - nothing else to run for particles
  const ctx = canvas.getContext('2d');

  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  let particles = [];
  const BASE_COUNT = Math.max(40, Math.round((W*H)/120000)); // scale with screen area
  const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function rand(min,max){ return Math.random()*(max-min)+min; }

  function createParticles(){
    particles = [];
    const count = BASE_COUNT;
    for(let i=0;i<count;i++){
      particles.push({
        x: rand(-50, W+50),
        y: rand(-50, H+50),
        vx: rand(-0.3, 0.6),
        vy: rand(-0.25, 0.5),
        size: rand(8, 28),
        alpha: rand(0.06, 0.55),
        char: CHARS.charAt(Math.floor(Math.random()*CHARS.length)),
        hue: Math.floor(rand(0, 360)),
        wobble: rand(0.5,2.5),
        rot: rand(0, Math.PI*2)
      });
    }
  }
  createParticles();

  function resize(){
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
    createParticles();
  }
  window.addEventListener('resize', resize);

  // draw one frame
  let t = 0;
  function drawFrame(){
    t += 0.01;
    // clear
    ctx.clearRect(0,0,W,H);

    // subtle base vignette overlay - not to fully override CSS background
    const bgGrad = ctx.createLinearGradient(0,0,W,H);
    if(document.body.classList.contains('theme-light')){
      bgGrad.addColorStop(0, 'rgba(255,255,255,0.02)');
      bgGrad.addColorStop(1, 'rgba(240,250,240,0.03)');
    } else {
      bgGrad.addColorStop(0, 'rgba(6,6,10,0.05)');
      bgGrad.addColorStop(1, 'rgba(0,0,0,0.15)');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0,0,W,H);

    // iterate particles
    for(let p of particles){
      // physics + wobble
      p.x += p.vx + Math.sin(t*p.wobble + p.rot)*0.4;
      p.y += p.vy + Math.cos(t*p.wobble + p.rot)*0.35;

      // wrap
      if(p.x < -80) p.x = W + 80;
      if(p.x > W + 80) p.x = -80;
      if(p.y < -80) p.y = H + 80;
      if(p.y > H + 80) p.y = -80;

      // choose color palette by theme
      let color;
      if(document.body.classList.contains('theme-light')){
        // bright olive + dark text accent + soft cyan tint occasional
        const palette = [
          `hsla(${100 + (p.hue%30)}, 45%, 35%, ${p.alpha})`, // olive family
          `hsla(${200 + (p.hue%40)}, 70%, 65%, ${p.alpha*0.85})`, // cyan/pale
          `hsla(0,0%,10%, ${p.alpha*0.95})` // dark ink small ones
        ];
        color = palette[Math.floor(Math.abs(Math.sin(p.hue))*palette.length) % palette.length];
      } else {
        // dark theme palette maroonish / soft purple / neon
        const palette = [
          `hsla(${350 + (p.hue%20)}, 75%, 48%, ${p.alpha})`, // maroon
          `hsla(${320 + (p.hue%30)}, 60%, 60%, ${p.alpha*0.8})`, // purple/pink
          `hsla(${200 + (p.hue%30)}, 70%, 60%, ${p.alpha*0.5})` // bluish glow
        ];
        color = palette[Math.floor(Math.abs(Math.cos(p.hue))*palette.length) % palette.length];
      }

      // draw glow (radial)
      const glowR = p.size * 2.4;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
      g.addColorStop(0, color);
      g.addColorStop(0.6, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, glowR, 0, Math.PI*2);
      ctx.fill();

      // draw char/number core
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.sin(t + p.rot) * 0.15);
      // font weight depends on theme
      ctx.font = `${Math.max(8, Math.round(p.size))}px Orbitron, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // text fill
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = Math.max(6, p.size*0.8);
      ctx.fillText(p.char, 0, 0);
      ctx.restore();
    }

    requestAnimationFrame(drawFrame);
  }

  requestAnimationFrame(drawFrame);

  // pause animation when page hidden to save CPU (browser throttles but extra check)
  document.addEventListener('visibilitychange', ()=> {
    if(document.hidden) {
      // nothing special — browser will throttles; leaving animation running is fine
    }
  });

  /* ---------- small UX: clicking theme buttons also randomize particles (nice) ---------- */
  function randomizeChars(){
    for(let p of particles){
      p.char = CHARS.charAt(Math.floor(Math.random()*CHARS.length));
      p.hue = Math.floor(rand(0,360));
    }
  }
  if(btnLight) btnLight.addEventListener('click', randomizeChars);
  if(btnDark) btnDark.addEventListener('click', randomizeChars);

  /* ---------- keyboard quick nav 1-5 ---------- */
  window.addEventListener('keydown', (e)=>{
    if(document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.isContentEditable)) return;
    const map = {Digit1:'home', Digit2:'about', Digit3:'thoughts', Digit4:'skills', Digit5:'connect'};
    if(map[e.code]){
      const b = document.querySelector(`.nav-btn[data-target="${map[e.code]}"]`);
      if(b) b.click();
    }
  });

}); // DOMContentLoaded end
