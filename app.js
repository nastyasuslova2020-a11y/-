const header = document.getElementById('H');
const burger = document.getElementById('B');
const navLinks = document.getElementById('NL');

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', scrollY > 30);
  document.getElementById('GT')?.classList.toggle('show', scrollY > 500);
}, {passive: true});

burger?.addEventListener('click', () => {
  const o = navLinks.classList.toggle('open');
  burger.classList.toggle('open', o);
  document.body.style.overflow = o ? 'hidden' : '';
});

document.addEventListener('click', e => {
  if (navLinks?.classList.contains('open') && !header?.contains(e.target)) {
    navLinks.classList.remove('open');
    burger?.classList.remove('open');
    document.body.style.overflow = '';
  }
});

document.getElementById('GT')?.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

const revEls = document.querySelectorAll('.rv-up,.rv-left,.rv-right');
if (revEls.length) {
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, {threshold:.12, rootMargin:'0px 0px -40px 0px'}).observe = (function(orig){
    return function(el){ orig.call(this, el); };
  })(IntersectionObserver.prototype.observe);

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, {threshold:.12, rootMargin:'0px 0px -40px 0px'});
  revEls.forEach(el => obs.observe(el));
}

(function(){
  const barsEl = document.getElementById('chartBars');
  const legEl  = document.getElementById('chartLeg');
  if (!barsEl) return;

  const data = [
    {name:'ChatGPT',         val:3800, cat:'OpenAI',     color:'#10b981', link:'nn-chatgpt.html'},
    {name:'Google Gemini',   val:2100, cat:'Google',     color:'#3b82f6', link:'nn-gemini.html'},
    {name:'Microsoft Copilot',val:1400,cat:'Microsoft',  color:'#8b5cf6', link:'nn-copilot.html'},
    {name:'Claude',          val:800,  cat:'Anthropic',  color:'#f59e0b', link:'nn-claude.html'},
    {name:'Midjourney',      val:260,  cat:'Midjourney', color:'#ef4444', link:'nn-midjourney.html'},
    {name:'Perplexity AI',   val:230,  cat:'Perplexity', color:'#06b6d4', link:'nn-perplexity.html'},
    {name:'Stable Diffusion',val:140,  cat:'Stability',  color:'#f97316', link:'nn-stablediffusion.html'},
    {name:'Grok (xAI)',      val:120,  cat:'xAI',        color:'#a855f7', link:'nn-grok.html'},
  ];
  const max = data[0].val;

  data.forEach(d => {
    const pct = (d.val / max * 100).toFixed(1);
    const label = d.val >= 1000 ? (d.val/1000).toFixed(1)+'B' : d.val+'M';
    const row = document.createElement('div');
    row.className = 'chart-row';
    row.style.cursor = 'pointer';
    row.innerHTML = `<div class="chart-name">${d.name}</div>
      <div class="chart-track"><div class="chart-fill" data-pct="${pct}" style="background:${d.color}"><span class="chart-cat">${d.cat}</span></div></div>
      <div class="chart-val">${label}<span>млн/мес</span></div>`;
    row.addEventListener('click', () => location.href = d.link);
    barsEl.appendChild(row);

    const li = document.createElement('div');
    li.className = 'leg-item';
    li.innerHTML = `<div class="leg-dot" style="background:${d.color}"></div>${d.name}`;
    legEl?.appendChild(li);
  });

  const sec = document.getElementById('chartSec');
  if (!sec) return;
  let done = false;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !done) {
      done = true;
      document.querySelectorAll('.chart-fill').forEach((el, i) =>
        setTimeout(() => el.style.width = el.dataset.pct + '%', i * 90));
    }
  }, {threshold:.25}).observe(sec);
})();

(function(){
  const wrap = document.getElementById('neuralWrap');
  if (!wrap) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'neuralCanvas';
  canvas.style.cssText = 'width:100%;height:100%';
  wrap.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W, H, nodes, raf;
  const N = 28, DIST = 130;

  function init() {
    const r = wrap.getBoundingClientRect();
    W = canvas.width  = r.width  || 380;
    H = canvas.height = r.height || 280;
    nodes = Array.from({length:N}, () => ({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*.6, vy:(Math.random()-.5)*.6,
      r:Math.random()*3+2, p:Math.random()*Math.PI*2
    }));
  }

  function draw() {
    ctx.clearRect(0,0,W,H);
    for (let i=0;i<nodes.length;i++) for (let j=i+1;j<nodes.length;j++) {
      const dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y, d=Math.hypot(dx,dy);
      if (d<DIST) {
        ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y);
        ctx.strokeStyle=`rgba(147,197,253,${(1-d/DIST)*.35})`; ctx.lineWidth=1; ctx.stroke();
      }
    }
    nodes.forEach(n => {
      n.p+=.03; const g=Math.sin(n.p)*.5+.5;
      const gr=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*4);
      gr.addColorStop(0,`rgba(251,191,36,${.3*g})`); gr.addColorStop(1,'rgba(251,191,36,0)');
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r*4,0,Math.PI*2); ctx.fillStyle=gr; ctx.fill();
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(147,197,253,${.7+.3*g})`; ctx.fill();
      n.x+=n.vx; n.y+=n.vy;
      if(n.x<0||n.x>W) n.vx*=-1;
      if(n.y<0||n.y>H) n.vy*=-1;
    });
    raf = requestAnimationFrame(draw);
  }

  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { cancelAnimationFrame(raf); draw(); }
    else cancelAnimationFrame(raf);
  });
  io.observe(wrap);
  window.addEventListener('resize', () => { cancelAnimationFrame(raf); init(); draw(); }, {passive:true});
  init();
})();

(function(){
  const btns = document.querySelectorAll('.fbtn');
  const cards = document.querySelectorAll('.nc');
  if (!btns.length) return;
  btns.forEach(btn => btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    const f = btn.dataset.f;
    cards.forEach(c => {
      const show = f === 'all' || c.dataset.cat === f;
      c.classList.toggle('hide', !show);
      if (show) { c.style.animation='none'; c.offsetHeight; c.style.animation=''; }
    });
  }));
})();

(function(){
  const form = document.getElementById('CF');
  const fb   = document.getElementById('CFB');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name  = document.getElementById('sn')?.value.trim();
    const email = document.getElementById('se')?.value.trim();
    if (!name || name.length < 2) { show('Пожалуйста, введите ваше имя.','#dc2626'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { show('Введите корректный email.','#dc2626'); return; }
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true; btn.textContent = 'Отправляем...';
    setTimeout(() => {
      show(`Спасибо, ${name}! Вы подписаны.`,'#16a34a');
      form.reset(); btn.disabled = false; btn.textContent = 'Подписаться на рассылку';
      setTimeout(() => fb.textContent = '', 5000);
    }, 900);
  });
  function show(msg, color) { if(fb){ fb.textContent=msg; fb.style.color=color; } }
})();

(function(){
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q')?.addEventListener('click', () => {
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        const a = i.querySelector('.faq-a');
        if (a) a.style.maxHeight = null;
      });
      if (!open) {
        item.classList.add('open');
        const a = item.querySelector('.faq-a');
        if (a) a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });
})();