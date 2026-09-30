import { clamp, wrap, leafGeometry, commits, riffleSequence, lensView } from './sketchbook-physics.mjs';

export function mountSketchbook(root) {
 const $=s=>root.querySelector(s), stage=$('.fn-stage'),scene=$('.fn-scene'),book=$('.fn-book');
 const select=$('[data-plates]'), plates=[...select.options].map(o=>({title:o.textContent.replace(/^\d+\s+/,''),url:o.dataset.image,alt:o.dataset.alt}));
 const total=plates.length, caption=$('.fn-caption'), glass=$('.fn-loupe'), zoomLayer=$('.fn-zoom-layer'),zoomInner=$('.fn-zoom-inner');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer: coarse), (max-width:600px)');
 const gentle=navigator.connection?.saveData||['slow-2g','2g','3g'].includes(navigator.connection?.effectiveType)||(navigator.deviceMemory||4)<=2;
 if(coarse.matches||gentle)plates.forEach((plate,i)=>{plate.url=select.options[i].dataset.small||plate.url;});
 let index=0,turn=null,drag=null,lensDrag=null,frame=0,lastTime=0,visible=false,started=false,intro=false,sequence=[],loadToken=0,destroyed=false;
 let strips=[],mirrors=[],lensOn=!coarse.matches,lensTarget=null;
 const view={rx:0,ry:0,z:1,tx:0,ty:0,tz:1}, lens={x:.88,y:.92};
 const cache=new Map(), cleanups=[];
 const on=(target,type,handler,opts)=>{target.addEventListener(type,handler,opts);cleanups.push(()=>target.removeEventListener(type,handler,opts));};
 const el=(name,cls)=>{const e=document.createElement(name);e.className=cls;return e;};
 const full=i=>{const d=el('div','fn-full'),im=new Image();im.loading=visible?'eager':'lazy';im.src=plates[i].url;im.alt=plates[i].alt;im.draggable=false;im.decoding='async';d.append(im);return d;};
 function load(i){
  i=wrap(i,total);if(!cache.has(i))cache.set(i,new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(true);im.onerror=()=>{cache.delete(i);resolve(false);};im.src=plates[i].url;}));
  return cache.get(i);
 }
 function syncMirror(){
  zoomInner.replaceChildren();mirrors=[];
  if(!lensOn||coarse.matches)return;
  const copy=scene.cloneNode(true);copy.removeAttribute('aria-describedby');
  copy.querySelectorAll('[tabindex]').forEach(e=>e.removeAttribute('tabindex'));
  copy.querySelectorAll('img').forEach(e=>e.alt='');zoomInner.append(copy);mirrors=[...copy.querySelectorAll('.fn-strip')];
 }
 function render(){
  book.replaceChildren(full(index));root.style.setProperty('--shade','0');
  root.dataset.page=String(index+1);select.value=String(index);caption.textContent=plates[index].title;
  root.dataset.state=intro?'intro':'idle';syncMirror();placeLens();
 }
 function layout(){root.style.setProperty('--bw',book.clientWidth+'px');placeLens();}
 function placeLens(){
  const w=book.clientWidth,h=book.clientHeight;if(!w)return;
  const size=clamp(w*.245,140,230),x=lens.x*w,y=lens.y*h;
  root.style.setProperty('--lens-size',size+'px');root.style.setProperty('--lens-radius',size*.43+'px');
  root.style.setProperty('--lx',x-size/2+'px');root.style.setProperty('--ly',y-size/2+'px');
  root.style.setProperty('--mx',x+'px');root.style.setProperty('--my',y+'px');
  const m=lensView(x,y,w,h,view.z);
  root.style.setProperty('--mtx',m.tx+'px');root.style.setProperty('--mty',m.ty+'px');
  zoomLayer.style.opacity=lensOn&&!coarse.matches?m.opacity:0;
  glass.classList.toggle('on',lensOn&&!coarse.matches);$('[data-lens]').setAttribute('aria-pressed',String(lensOn));
 }
 function paintTurn(p){
  if(!turn)return;turn.p=p;const g=leafGeometry(p);
  root.style.setProperty('--turn',g.base+'deg');root.style.setProperty('--curve',g.delta+'deg');root.style.setProperty('--shade',g.shade);
  g.light.forEach((light,i)=>{for(const strip of [strips[i],mirrors[i]])strip?.style.setProperty('--shadow',((1-light)*.55).toFixed(3));});
 }
 function begin(to,forward=true){
  if(turn)finish(true);if(to===index)return false;
  layout();book.replaceChildren();strips=[];
  for(const [right,i] of [[false,forward?index:to],[true,forward?to:index]]){const half=el('div','fn-half'+(right?' fn-right':''));half.append(full(i));book.append(half);}
  book.append(el('div','fn-gutter'));
  const curl=el('div','fn-curl'+(forward?'':' fn-backward'));curl.setAttribute('aria-hidden','true');let host=curl;const w=book.clientWidth,sw=w/36;
  for(let i=0;i<18;i++){
   const strip=el('div','fn-strip');
   for(const back of [false,true]){const face=el('div','fn-face'+(back?' fn-reverse':''));face.style.backgroundImage=`url("${plates[back?to:index].url}")`;
    const x=forward?(back?w/2-(i+1)*sw:w/2+i*sw):(back?w/2+i*sw:w/2-(i+1)*sw);face.style.backgroundPositionX=-x+'px';strip.append(face);}
   host.append(strip);host=strip;strips.push(strip);
  }
  book.append(curl);turn={to,forward,p:0,target:null,velocity:0};root.dataset.state=intro?'intro':'turning';syncMirror();paintTurn(0);
  if(lensOn&&!lensDrag)lensTarget={x:forward?.92:.08,y:1.025};
  kick();return true;
 }
 function finish(commit){const t=turn;turn=null;strips=[];if(t&&commit)index=t.to;render();}
 function cancelIntro(){if(!intro)return;intro=false;sequence=[];root.classList.remove('fn-riffling');if(turn)finish(true);root.dataset.state='idle';}
 function settle(commit){if(!turn)return;if(reduced.matches||gentle){finish(commit);return;}turn.target=commit?1:0;turn.velocity=0;kick();}
 async function go(to,forward=to>index){
  cancelIntro();drag=null;const token=++loadToken;to=wrap(to,total);
  if(!await load(to)||token!==loadToken||destroyed||document.hidden)return;
  if(reduced.matches||gentle){index=to;render();return;}
  if(begin(to,forward))settle(true);
 }
 function applyView(){root.style.setProperty('--rx',view.rx+'deg');root.style.setProperty('--ry',view.ry+'deg');root.style.setProperty('--zoom',view.z);placeLens();}
 function tick(now){
  frame=0;if(!visible||document.hidden||destroyed)return;
  const dt=clamp((now-lastTime)/1000,1/240,.032);lastTime=now;let active=false;
  if(turn?.target!==null&&turn){
   if(turn.duration){turn.elapsed+=dt*1000;paintTurn(clamp(turn.elapsed/turn.duration,0,1));if(turn.p>=1){finish(true);riffleNext();}else active=true;}
   else{const t=turn;t.velocity+=(-175*(t.p-t.target)-25*t.velocity)*dt;paintTurn(clamp(t.p+t.velocity*dt,0,1));
    if(Math.abs(t.p-t.target)<.002&&Math.abs(t.velocity)<.025)finish(t.target===1);else active=true;}
  }
  const ease=1-Math.exp(-14*dt);
  for(const [a,b] of [['rx','tx'],['ry','ty'],['z','tz']]){if(Math.abs(view[a]-view[b])>.001){view[a]+=(view[b]-view[a])*ease;active=true;}else view[a]=view[b];}
  if(lensTarget){const dx=lensTarget.x-lens.x,dy=lensTarget.y-lens.y;if(Math.abs(dx)+Math.abs(dy)<.001){lens.x=lensTarget.x;lens.y=lensTarget.y;lensTarget=null;}else{lens.x+=dx*ease;lens.y+=dy*ease;active=true;}}
  applyView();if(active)kick();else root.dataset.animating='false';
 }
 function kick(){if(!frame&&visible&&!document.hidden&&!destroyed){frame=requestAnimationFrame(tick);root.dataset.animating='true';}}
 function riffleNext(){
  if(!intro)return;const step=sequence.shift();
  if(!step){intro=false;root.classList.remove('fn-riffling');index=0;render();root.dataset.intro='complete';return;}
  if(begin(step.to,true)){turn.target=1;turn.duration=step.duration;turn.elapsed=0;kick();}
 }
 async function start(){
  if(started)return;started=true;const token=loadToken;root.dataset.intro='loading';
  if(reduced.matches||gentle){root.dataset.intro='skipped';load(index);if(!gentle)load(index+1);return;}
  const introCount=coarse.matches?Math.min(2,total):total;
  const okay=await Promise.all(Array.from({length:introCount},(_,i)=>load(i)));
  if(!visible||document.hidden||token!==loadToken||destroyed||okay.some(v=>!v))return;
  index=0;intro=true;sequence=riffleSequence(introCount).map(step=>coarse.matches?{...step,duration:650}:step);root.classList.add('fn-riffling');root.dataset.intro='playing';riffleNext();
 }
 function suspend(){
  ++loadToken;if(root.dataset.intro==='loading'||intro){started=false;root.dataset.intro='pending';}if(frame)cancelAnimationFrame(frame);frame=0;root.dataset.animating='false';
  if(intro){intro=false;sequence=[];root.classList.remove('fn-riffling');turn=null;index=0;render();}else if(turn)finish(true);
  drag=null;lensDrag=null;lensTarget=null;view.rx=view.ry=view.tx=view.ty=0;applyView();
 }
 on($('[data-prev]'),'click',()=>go(wrap(index-1,total),false));on($('[data-next]'),'click',()=>go(wrap(index+1,total),true));
 on(select,'change',()=>go(Number(select.value)));
 on(root,'keydown',e=>{if(e.target===select||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();go(wrap(index+(e.key==='ArrowRight'?1:-1),total),e.key==='ArrowRight');}if(e.key==='Escape'){cancelIntro();if(turn)finish(false);zoom(1-view.tz);}});
 on(book,'pointerdown',e=>{
  if(e.button!==0)return;cancelIntro();++loadToken;
  const r=book.getBoundingClientRect(),forward=e.clientX>r.left+r.width/2;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,w:r.width,forward,last:performance.now(),velocity:0,distance:0,previous:0,touch:e.pointerType==='touch'};
  if(!drag.touch&&!coarse.matches&&!reduced.matches){begin(wrap(index+(forward?1:-1),total),forward);book.setPointerCapture(e.pointerId);}
 });
 on(book,'pointermove',e=>{
  if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.distance=Math.max(drag.distance,Math.hypot(dx,dy));
  if(drag.touch)return;
  const p=clamp(dx*(drag.forward?-1:1)/(drag.w*.55),0,1),now=performance.now();drag.velocity=(p-drag.previous)/Math.max(.016,(now-drag.last)/1000);drag.previous=p;drag.last=now;paintTurn(p);
 });
 const release=(e,cancelled=false)=>{if(!drag)return;const d=drag;drag=null;
  if(d.touch||coarse.matches||reduced.matches){if(!cancelled&&d.distance<8)go(wrap(index+(d.forward?1:-1),total),d.forward);return;}
  settle(commits(turn?.p||0,performance.now()-d.last<100?d.velocity:0,d.distance,cancelled));
  if(book.hasPointerCapture?.(e.pointerId))book.releasePointerCapture(e.pointerId);
 };
 on(book,'pointerup',e=>release(e));on(book,'pointercancel',e=>release(e,true));on(book,'lostpointercapture',e=>{if(drag)release(e,true);});
 on(book,'dragstart',e=>e.preventDefault());
 on(stage,'pointermove',e=>{if(drag||lensDrag||coarse.matches||reduced.matches||intro)return;const r=scene.getBoundingClientRect();view.tx=clamp(-(e.clientY-r.top-r.height/2)/r.height*6,-3,3);view.ty=clamp((e.clientX-r.left-r.width/2)/r.width*9,-4.5,4.5);kick();});
 on(stage,'pointerleave',()=>{view.tx=view.ty=0;kick();});
 function zoom(delta){cancelIntro();view.tz=clamp(view.tz+delta,.9,1.35);$('[data-zoom-read]').textContent=Math.round(view.tz*100)+'%';$('[data-zoom-out]').disabled=view.tz<=.9;$('[data-zoom-in]').disabled=view.tz>=1.35;if(reduced.matches){view.z=view.tz;applyView();}else kick();}
 on($('[data-zoom-in]'),'click',()=>zoom(.1));on($('[data-zoom-out]'),'click',()=>zoom(-.1));
 on($('[data-lens]'),'click',()=>{cancelIntro();lensOn=!lensOn;syncMirror();placeLens();});
 on(glass,'pointerdown',e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();cancelIntro();lensTarget=null;lensDrag={id:e.pointerId,x:e.clientX,y:e.clientY,lx:lens.x,ly:lens.y};glass.setPointerCapture(e.pointerId);});
 on(glass,'pointermove',e=>{if(!lensDrag)return;const w=book.clientWidth,h=book.clientHeight;lens.x=clamp(lensDrag.lx+(e.clientX-lensDrag.x)/w,-.1,1.08);lens.y=clamp(lensDrag.ly+(e.clientY-lensDrag.y)/h,-.05,1.15);placeLens();});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])on(glass,type,()=>{lensDrag=null;});
 const observer=new IntersectionObserver(es=>{visible=es[0].isIntersecting&&es[0].intersectionRatio>=.6;if(visible){start();if(view.z!==view.tz)kick();}else suspend();},{threshold:[0,.6]});observer.observe(scene);
 let measuredWidth=scene.clientWidth;
 const resize=new ResizeObserver(()=>{if(scene.clientWidth===measuredWidth)return;measuredWidth=scene.clientWidth;if(turn)suspend();layout();if(visible)start();});resize.observe(scene);
 on(document,'visibilitychange',()=>{if(document.hidden)suspend();else if(visible){start();if(view.z!==view.tz)kick();}});on(window,'pagehide',suspend);
 on(reduced,'change',suspend);on(coarse,'change',()=>{suspend();lensOn=!coarse.matches;syncMirror();placeLens();});
 render();layout();
 return {destroy(){destroyed=true;suspend();observer.disconnect();resize.disconnect();cleanups.forEach(fn=>fn());cache.clear();},go};
}
const root=document.querySelector('#field-notes');if(root)mountSketchbook(root);
