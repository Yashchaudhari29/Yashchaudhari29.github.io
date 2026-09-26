import { driver, sizeProjectCanvas } from './animation-driver.mjs';
  import { initMedia } from './media-runtime.mjs';
  initMedia();
  document.getElementById('current-year').textContent = new Date().getFullYear();
  document.querySelectorAll('[data-skill-card]').forEach(button => button.addEventListener('click', () => {
    document.getElementById('skCard' + button.dataset.skillCard)?.scrollIntoView({behavior:'smooth', block:'center'});
  }));
  /* 1. Typed.js */
  if (window.Typed) new Typed('#heroTyped', {
    strings: ['ML Engineer','Full-Stack Dev','Data Scientist','AI Builder','Django Dev'],
    typeSpeed:58, backSpeed:28, backDelay:1900, loop:true,
  });

  /* 2. Scroll progress bar */
  const pf = document.getElementById('pbar-fill');
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    pf.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  }, { passive:true });

  /* 3. Mobile menu */
  const ham = document.getElementById('ham');
  const mm  = document.getElementById('mobile-menu');
  const b1  = document.getElementById('b1');
  const b2  = document.getElementById('b2');
  let mOpen = false;
  function toggleMenu(v) {
    mOpen = v !== undefined ? v : !mOpen;
    mm.classList.toggle('open', mOpen);
    b1.style.transform = mOpen ? 'translateY(3.5px) rotate(45deg)' : '';
    b2.style.transform = mOpen ? 'translateY(-3.5px) rotate(-45deg)' : '';
    document.body.style.overflow = mOpen ? 'hidden' : '';
  }
  ham.addEventListener('click', () => toggleMenu());
  mm.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  /* 4. Reveal on scroll */
  const ro = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting) e.target.classList.add('in'); }), { threshold:0.13 });
  document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

  /* 5. Reveal-X (skill cards) */
  const rx = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); rx.unobserve(e.target); } }), { threshold:0.13 });
  document.querySelectorAll('.reveal-x').forEach(el => rx.observe(el));

  /* 6. Active skill nav */
  const skBtns = document.querySelectorAll('.sk-nav-btn');
  const sa = new IntersectionObserver(es => es.forEach(e => {
    if(e.isIntersecting){ const i=parseInt(e.target.dataset.ski); skBtns.forEach((b,j)=>b.classList.toggle('active',j===i)); }
  }), { threshold:0.55 });
  document.querySelectorAll('[data-ski]').forEach(el => sa.observe(el));

  /* 7. Smooth anchor scroll */
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth'}); }
  }));

  /* 8. Intro screen cleanup & Avatar Auto-Expand */
  setTimeout(() => {
    const intro = document.getElementById('intro-screen');
    if(intro){ intro.style.pointerEvents='none'; intro.style.visibility='hidden'; }
    
    const avatarCard = document.getElementById('avatar-card');
    if(avatarCard){
      avatarCard.classList.add('auto-expand');
      setTimeout(() => {
        avatarCard.classList.remove('auto-expand');
      }, 5000);
    }
  }, 3600);

  /* Canvas callbacks share one visibility-aware driver. */
  /* — Project 1: IntelliFace — Face Recognition Scan — */
  (function animFace(){
    const c=document.getElementById('anim-face'); if(!c)return;
    const { ctx, size } = sizeProjectCanvas(c);
    let t=0;
    const DOTS=[];
    // Generate face dot grid
    for(let r=0;r<9;r++) for(let col=0;col<14;col++){
      DOTS.push({x:60+col*28,y:20+r*16,lit:false,delay:Math.random()*120});
    }
    // Bounding box
    const BOX={x:180,y:18,w:140,h:138};
    function draw(_time, delta){
      const step = delta / (1000 / 60);
      const previousT = t; t += step;
      ctx.clearRect(0,0,size.width,size.height);
      // Dark bg gradient
      const g=ctx.createLinearGradient(0,0,size.width,size.height);
      g.addColorStop(0,'#050709'); g.addColorStop(1,'#0a1a10');
      ctx.fillStyle=g; ctx.fillRect(0,0,size.width,size.height);
      // Grid dots
      DOTS.forEach(d=>{
        const inBox=d.x>BOX.x&&d.x<BOX.x+BOX.w&&d.y>BOX.y&&d.y<BOX.y+BOX.h;
        d.lit = inBox && t>d.delay;
        ctx.beginPath(); ctx.arc(d.x,d.y,d.lit?2.2:1.2,0,Math.PI*2);
        ctx.fillStyle=d.lit?`rgba(56,221,118,${0.6+0.4*Math.sin(t*0.05+d.delay)})`:'rgba(255,255,255,0.08)';
        ctx.fill();
      });
      // Scan line
      const scanY=BOX.y+(((t*1.2)%(BOX.h+20))-10);
      const sg=ctx.createLinearGradient(0,scanY-14,0,scanY+14);
      sg.addColorStop(0,'transparent'); sg.addColorStop(0.5,'rgba(56,221,118,0.6)'); sg.addColorStop(1,'transparent');
      ctx.fillStyle=sg; ctx.fillRect(BOX.x-4,scanY-14,BOX.w+8,28);
      // Bounding box corners
      const cl=BOX.x,ct=BOX.y,cr=BOX.x+BOX.w,cb=BOX.y+BOX.h,cs=18;
      ctx.strokeStyle='#38dd76'; ctx.lineWidth=2; ctx.lineCap='round';
      [[cl,ct,cl+cs,ct],[cl,ct,cl,ct+cs],[cr,ct,cr-cs,ct],[cr,ct,cr,ct+cs],
       [cl,cb,cl+cs,cb],[cl,cb,cl,cb-cs],[cr,cb,cr-cs,cb],[cr,cb,cr,cb-cs]].forEach(([x1,y1,x2,y2])=>{
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });
      // Label
      ctx.font='bold 10px Inter,sans-serif'; ctx.fillStyle='#38dd76';
      ctx.fillText('FACE_ID · ' + (t>60?'MATCH ✓':'SCANNING...'), BOX.x, BOX.y-6);
      // Probability bar
      const pct=Math.min(1,(t-60)/80); if(t>60){
        ctx.fillStyle='rgba(56,221,118,0.15)'; ctx.fillRect(size.width-90,40,70,10);
        ctx.fillStyle='#38dd76'; ctx.fillRect(size.width-90,40,70*pct,10);
        ctx.font='9px Inter,sans-serif'; ctx.fillStyle='#38dd76';
        ctx.fillText((pct*100).toFixed(0)+'%',size.width-90,35);
      }
    }
    driver.register(c, draw);
  })();

  /* — Project 2: Capstone Data Science — Animated Chart — */
  (function animData(){
    const c=document.getElementById('anim-data'); if(!c)return;
    const { ctx, size } = sizeProjectCanvas(c);
    let t=0;
    const bars=[0.4,0.65,0.5,0.82,0.7,0.91,0.78,0.95,0.88,1.0];
    const LINE=[0.3,0.45,0.38,0.6,0.72,0.65,0.83,0.78,0.9,1.0];
    function draw(_time, delta){
      const step = delta / (1000 / 60);
      const previousT = t; t += step;
      ctx.clearRect(0,0,size.width,size.height);
      const g=ctx.createLinearGradient(0,0,0,size.height);
      g.addColorStop(0,'#050a12'); g.addColorStop(1,'#08050f');
      ctx.fillStyle=g; ctx.fillRect(0,0,size.width,size.height);
      // Grid
      ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
      for(let i=1;i<5;i++){ ctx.beginPath(); ctx.moveTo(32,20+i*28); ctx.lineTo(size.width-20,20+i*28); ctx.stroke(); }
      // Bars
      const bw=22, gap=12, maxH=112, baseY=148, prog=Math.min(1,t/80);
      bars.forEach((v,i)=>{
        const bx=36+i*(bw+gap), bh=v*maxH*prog;
        const bg=ctx.createLinearGradient(0,baseY-bh,0,baseY);
        bg.addColorStop(0,'rgba(56,221,118,0.9)'); bg.addColorStop(1,'rgba(56,221,118,0.2)');
        ctx.fillStyle=bg;
        ctx.beginPath(); ctx.roundRect(bx,baseY-bh,bw,bh,3); ctx.fill();
      });
      // Line chart
      if(t>40){
        const lp=Math.min(1,(t-40)/60);
        ctx.beginPath(); ctx.strokeStyle='#38bdf8'; ctx.lineWidth=2;
        LINE.slice(0,Math.ceil(LINE.length*lp)).forEach((v,i)=>{
          const lx=36+i*(bw+gap)+bw/2, ly=baseY-v*maxH;
          i===0?ctx.moveTo(lx,ly):ctx.lineTo(lx,ly);
        });
        ctx.stroke();
        // Dots
        LINE.slice(0,Math.ceil(LINE.length*lp)).forEach((v,i)=>{
          ctx.beginPath(); ctx.arc(36+i*(bw+gap)+bw/2,baseY-v*maxH,3,0,Math.PI*2);
          ctx.fillStyle='#38bdf8'; ctx.fill();
        });
      }
      // Labels
      ctx.font='bold 9px Inter,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.35)';
      ctx.fillText('ACCURACY: '+((prog)*100).toFixed(0)+'%',36,14);
      ctx.fillStyle='#38dd76'; ctx.fillText('MODEL PERFORMANCE',size.width-130,14);
    }
    driver.register(c, draw);
  })();

  /* — Project 3: NBSpamDetect — Email Filter Animation — */
  (function animSpam(){
    const c=document.getElementById('anim-spam'); if(!c)return;
    const { ctx, size } = sizeProjectCanvas(c);
    let t=0;
    const emails=[];
    function spawnEmail(){
      emails.push({x:Math.random()*size.width,y:-20,vy:1.2+Math.random()*0.8,
        isSpam:Math.random()>0.4,
        classified:false,classAt:0,alpha:1});
    }
    for(let i=0;i<6;i++) spawnEmail();
    function drawEnvelope(x,y,spam,classified,alpha){
      ctx.save(); ctx.globalAlpha=alpha;
      ctx.fillStyle=classified?(spam?'rgba(239,68,68,0.3)':'rgba(56,221,118,0.3)'):'rgba(255,255,255,0.08)';
      ctx.strokeStyle=classified?(spam?'#ef4444':'#38dd76'):'rgba(255,255,255,0.2)';
      ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.roundRect(x-18,y-12,36,24,3); ctx.fill(); ctx.stroke();
      // Envelope flap
      ctx.beginPath(); ctx.moveTo(x-18,y-12); ctx.lineTo(x,y+2); ctx.lineTo(x+18,y-12);
      ctx.strokeStyle=classified?(spam?'rgba(239,68,68,0.6)':'rgba(56,221,118,0.6)'):'rgba(255,255,255,0.12)';
      ctx.stroke();
      if(classified){
        ctx.font='bold 7px Inter,sans-serif';
        ctx.fillStyle=spam?'#ef4444':'#38dd76';
        ctx.textAlign='center';
        ctx.fillText(spam?'SPAM':'HAM',x,y+5);
      }
      ctx.restore();
    }
    // Filter gate
    const gateY=100;
    function draw(_time, delta){
      const step = delta / (1000 / 60);
      const previousT = t; t += step;
      ctx.clearRect(0,0,size.width,size.height);
      const g=ctx.createLinearGradient(0,0,0,size.height);
      g.addColorStop(0,'#0a0505'); g.addColorStop(1,'#050a08');
      ctx.fillStyle=g; ctx.fillRect(0,0,size.width,size.height);
      // Filter gate line
      const gateGrad=ctx.createLinearGradient(0,0,size.width,0);
      gateGrad.addColorStop(0,'transparent'); gateGrad.addColorStop(0.5,'rgba(56,221,118,0.4)'); gateGrad.addColorStop(1,'transparent');
      ctx.fillStyle=gateGrad; ctx.fillRect(0,gateY-1,size.width,2);
      ctx.font='bold 9px Inter,sans-serif'; ctx.fillStyle='rgba(56,221,118,0.6)'; ctx.textAlign='right';
      ctx.fillText('NAIVE BAYES FILTER',size.width-14,gateY-6);
      // Emails
      emails.forEach(e=>{
        e.y+=e.vy*step;
        if(!e.classified && e.y>gateY){ e.classified=true; e.classAt=t; }
        if(e.classified) e.alpha=Math.max(0,1-(t-e.classAt)/40);
        drawEnvelope(e.x,e.y,e.isSpam,e.classified,e.alpha);
      });
      // Clean up + spawn
      for(let i=emails.length-1;i>=0;i--) if(emails[i].y>size.height+30||emails[i].alpha<=0) emails.splice(i,1);
      if(Math.floor(t/55)>Math.floor(previousT/55)) spawnEmail();
      // Stats
      const spam=emails.filter(e=>e.isSpam&&e.classified).length;
      const ham=emails.filter(e=>!e.isSpam&&e.classified).length;
      ctx.font='bold 9px Inter,sans-serif'; ctx.textAlign='left';
      ctx.fillStyle='#ef4444'; ctx.fillText('SPAM: '+spam, 14,20);
      ctx.fillStyle='#38dd76'; ctx.fillText('HAM: '+ham, 14,34);
    }
    driver.register(c, draw);
  })();

  /* — Project 4: Digit Recognition — MNIST Pixel Draw — */
  (function animDigit(){
    const c=document.getElementById('anim-digit'); if(!c)return;
    const { ctx, size } = sizeProjectCanvas(c);
    const DIGITS=[
      [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
      [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
      [[0,1,1,1,0],[1,0,0,0,1],[0,0,1,1,0],[0,1,0,0,0],[1,1,1,1,1]],
      [[1,1,1,1,0],[0,0,0,0,1],[0,0,1,1,0],[0,0,0,0,1],[1,1,1,1,0]],
      [[1,0,0,1,0],[1,0,0,1,0],[1,1,1,1,1],[0,0,0,1,0],[0,0,0,1,0]],
      [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[0,0,0,0,1],[1,1,1,1,0]],
      [[0,1,1,1,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0]],
      [[1,1,1,1,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,0,0,0,0]],
      [[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0]],
      [[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[0,1,1,1,0]],
    ];
    let t=0, curDigit=0, nextAt=120, revealProgress=0, confScore=0;
    const PS=24, gap=3;
    function draw(_time, delta){
      const step = delta / (1000 / 60);
      const previousT = t; t += step;
      ctx.clearRect(0,0,size.width,size.height);
      const g=ctx.createLinearGradient(0,0,size.width,size.height);
      g.addColorStop(0,'#060610'); g.addColorStop(1,'#0a0614');
      ctx.fillStyle=g; ctx.fillRect(0,0,size.width,size.height);
      if(t>=nextAt){ t=0; curDigit=(curDigit+1)%10; nextAt=120; revealProgress=0; confScore=0; }
      revealProgress=Math.min(25,revealProgress+0.35*step);
      confScore=Math.min(1,confScore+(revealProgress>20?0.04*step:0));
      const CX=size.width/2-80, CY=size.height/2-36;
      // Draw pixel grid
      const grid=DIGITS[curDigit];
      let pixCount=0;
      grid.forEach((row,r)=>{
        row.forEach((cell,col)=>{
          if(!cell){ return; }
          pixCount++;
          const revealed=pixCount<=Math.floor(revealProgress*2);
          const px=CX+col*(PS+gap), py=CY+r*(PS+gap);
          const bright=revealed?1:0.06;
          const alpha=revealed?(0.7+0.3*Math.sin(t*0.08+pixCount*0.4)):0.08;
          ctx.beginPath(); ctx.roundRect(px,py,PS,PS,4);
          ctx.fillStyle=revealed?`rgba(56,221,118,${alpha})`:`rgba(255,255,255,${bright*0.05})`;
          ctx.fill();
          if(revealed){
            const gg=ctx.createRadialGradient(px+PS/2,py+PS/2,0,px+PS/2,py+PS/2,PS);
            gg.addColorStop(0,'rgba(56,221,118,0.25)'); gg.addColorStop(1,'transparent');
            ctx.fillStyle=gg; ctx.fill();
          }
        });
      });
      // Label
      ctx.font='bold 36px Inter,sans-serif';
      ctx.fillStyle=`rgba(255,255,255,${confScore*0.8})`;
      ctx.textAlign='center';
      ctx.fillText(curDigit, CX+5*(PS+gap)+40, CY+4*(PS+gap)+14);
      // Confidence bar
      ctx.font='9px Inter,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.textAlign='left';
      ctx.fillText('CONFIDENCE',CX+5*(PS+gap)+20,CY+4*(PS+gap)+32);
      ctx.fillStyle='rgba(56,221,118,0.18)'; ctx.fillRect(CX+5*(PS+gap)+20,CY+4*(PS+gap)+36,80,6);
      ctx.fillStyle='#38dd76'; ctx.fillRect(CX+5*(PS+gap)+20,CY+4*(PS+gap)+36,80*confScore,6);
      // SVM label
      ctx.font='bold 9px Inter,sans-serif'; ctx.fillStyle='rgba(56,221,118,0.55)'; ctx.textAlign='right';
      ctx.fillText('SVM · MNIST',size.width-14,14);
    }
    driver.register(c, draw);
  })();
