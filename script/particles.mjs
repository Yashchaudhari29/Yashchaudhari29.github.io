// Shared full-quality renderer: worker primary, shared-driver fallback.
export function createParticles(pc, width, height, dpr) {
  const pCtx = pc.getContext('2d');
  let W = width, H = height;
  const particles = Array.from({length:55}, () => ({x:Math.random()*W, y:Math.random()*H,
    r:Math.random()*1.8+0.4, dx:(Math.random()-0.5)*0.25, dy:(Math.random()-0.5)*0.25,
    a:Math.random()*0.5+0.15, col:Math.random()>0.65?'#38dd76':Math.random()>0.5?'#38bdf8':'#fff'}));
  function resize(width,height,dpr) {
    W=width; H=height; pc.width=Math.round(W*dpr); pc.height=Math.round(H*dpr);
    pCtx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize(width,height,dpr);
    function render(_time, delta){
      const step = delta / (1000 / 60);
      pCtx.clearRect(0,0,W,H);
      particles.forEach(p=>{
        p.x+=p.dx*step; p.y+=p.dy*step;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0;
        if(p.y<0)p.y=H; if(p.y>H)p.y=0;
        pCtx.beginPath();
        pCtx.arc(p.x,p.y,p.r,0,Math.PI*2);
        pCtx.fillStyle=p.col;
        pCtx.globalAlpha=p.a;
        pCtx.fill();
        pCtx.globalAlpha=1;
      });
      // Draw connecting lines
      for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
          const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y;
          const dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<120){
            pCtx.beginPath();
            pCtx.moveTo(particles[i].x,particles[i].y);
            pCtx.lineTo(particles[j].x,particles[j].y);
            pCtx.strokeStyle='rgba(56,221,118,0.08)';
            pCtx.lineWidth=0.6;
            pCtx.globalAlpha=(1-dist/120)*0.35;
            pCtx.stroke();
            pCtx.globalAlpha=1;
          }
        }
      }
    }

  return {render,resize};
}
