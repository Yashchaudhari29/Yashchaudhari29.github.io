import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { clamp,wrap,leafGeometry,commits,riffleSequence,lensView } from '../script/sketchbook-physics.mjs';
import { plates } from '../tools/sketchbook-plates.mjs';
const source=readFileSync(new URL('../script/field-notes.mjs',import.meta.url),'utf8');
const flush=()=>new Promise(setImmediate);

test('curved leaf is flat at both ends and curves at the midpoint',()=>{
 for(const p of [0,1]){const g=leafGeometry(p);assert.ok(Math.abs(g.delta)<1e-12);assert.equal(g.base,180*p);}
 const mid=leafGeometry(.5);assert.ok(mid.delta<0);assert.equal(mid.light.length,18);assert.equal(mid.shade,1);
 assert.equal(leafGeometry(-1).base,0);assert.equal(leafGeometry(2).base,180);
});
test('fast short throws commit, slow short drags roll back, cancellation wins',()=>{
 assert.equal(commits(.2,1.2,50),true);assert.equal(commits(.2,.1,50),false);
 assert.equal(commits(.7,0,200),true);assert.equal(commits(.7,2,200,true),false);assert.equal(commits(0,0,2),true);
});
test('riffle visits every spread and ends at first; navigation wraps',()=>{
 const steps=riffleSequence(8);assert.equal(steps.length,8);assert.equal(steps.at(-1).to,0);assert.equal(new Set(steps.map(s=>s.to)).size,8);
 assert.equal(wrap(-1,8),7);assert.equal(wrap(8,8),0);
});
test('magnification stays anchored to the lens and fades beyond the paper',()=>{
 const m=lensView(300,200,900,600,1);assert.ok(Math.abs(m.tx+300*2.15-300)<1e-10);assert.equal(m.opacity,1);
 assert.equal(lensView(1100,200,900,600,1).opacity,0);
});

function fixture({reduced=false,coarse=false,saveData=false,rafLag=0}={}){
 let now=0,id=0;const pending=new Map(),observers=[];
 class E{
  constructor(cls=''){this.className=cls;this.children=[];this.dataset={};this.attrs={};this.handlers={};this.clientWidth=900;this.clientHeight=600;this.style={setProperty(k,v){this[k]=v;}};this.classList={toggle:(c,yes)=>{const parts=new Set(this.className.split(' '));if(yes)parts.add(c);else parts.delete(c);this.className=[...parts].join(' ');},add:c=>this.classList.toggle(c,true),remove:c=>this.classList.toggle(c,false)};}
  append(...els){this.children.push(...els);}replaceChildren(...els){this.children=els;}
  setAttribute(k,v){this.attrs[k]=v;}removeAttribute(k){delete this.attrs[k];}
  addEventListener(t,fn){(this.handlers[t]??=[]).push(fn);}removeEventListener(){}
  fire(t,e={}){for(const fn of this.handlers[t]||[])fn(e);}
  querySelectorAll(s){return this.children.flatMap(c=>[(s==='img'&&c.isImage)||(s==='.fn-strip'&&c.className==='fn-strip')?c:null,...c.querySelectorAll(s)]).filter(Boolean);}
  cloneNode(){const e=new E(this.className);e.children=this.children.map(c=>c.cloneNode(true));return e;}
  getBoundingClientRect(){return {left:0,top:0,width:900,height:600};}setPointerCapture(){}hasPointerCapture(){return false;}
 }
 const keys=['.fn-stage','.fn-scene','.fn-book','[data-plates]','.fn-caption','.fn-loupe','.fn-zoom-layer','.fn-zoom-inner','[data-lens]','[data-prev]','[data-next]','[data-zoom-read]','[data-zoom-out]','[data-zoom-in]'];
 const map=Object.fromEntries(keys.map(k=>[k,new E(k.slice(1))]));map['.fn-scene'].append(map['.fn-book']);
 map['[data-plates]'].options=plates.map(([name,title,alt],i)=>({textContent:`${i+1} ${title}`,dataset:{image:`/assets/sketchbook/${name}.webp`,alt}}));
 const root=new E(),doc=new E(),win=new E();root.querySelector=s=>map[s];doc.querySelector=()=>null;doc.createElement=()=>new E();doc.hidden=false;
 class Img extends E{constructor(){super();this.isImage=true;}set src(v){this.url=v;queueMicrotask(()=>this.onload?.());}}
 const ctx={document:doc,window:win,navigator:{connection:{saveData},deviceMemory:8},Image:Img,performance:{now:()=>now},requestAnimationFrame:fn=>{pending.set(++id,fn);return id;},cancelAnimationFrame:i=>pending.delete(i),matchMedia:q=>Object.assign(new E(),{matches:q.includes('reduced')?reduced:coarse}),IntersectionObserver:class{constructor(cb){observers.push(cb);}observe(){}disconnect(){}},ResizeObserver:class{observe(){}disconnect(){}},clamp,wrap,leafGeometry,commits,riffleSequence,lensView};
 runInNewContext(source.replace(/^import[^\n]+\n/,'').replace('export function','function')+'\nthis.mount=mountSketchbook;',ctx);
 const instance=ctx.mount(root);
 function frames(limit=500){let n=0;while(pending.size&&n++<limit){now+=16;const batch=[...pending.values()];pending.clear();batch.forEach(fn=>fn(now-rafLag));}return n;}
 return {root,map,doc,instance,pending,frames,show:(ratio=1)=>observers[0]([{isIntersecting:true,intersectionRatio:ratio}]),hide:()=>observers[0]([{isIntersecting:false}])};
}
test('intro ends on first spread and scheduling stops while idle',async()=>{
 const f=fixture();f.show();await flush();assert.equal(f.root.dataset.intro,'playing');assert.ok(f.frames()<500);assert.equal(f.root.dataset.page,'1');assert.equal(f.root.dataset.intro,'complete');assert.equal(f.pending.size,0);f.instance.destroy();
});
test('offscreen interruption cancels riffle and leaves first spread',async()=>{
 const f=fixture();f.show();await flush();f.frames(10);f.hide();assert.equal(f.pending.size,0);assert.equal(f.root.dataset.page,'1');assert.equal(f.root.dataset.state,'idle');f.instance.destroy();
});
test('delayed frame delivery settles the riffle and keeps the lens beside the book',async()=>{
 const f=fixture({rafLag:25});f.show();await flush();assert.ok(f.frames()<500);
 assert.equal(f.root.dataset.page,'1');assert.equal(f.root.dataset.intro,'complete');
 const left=parseFloat(f.root.style['--lx']);assert.ok(left>=0&&left<900);assert.equal(f.pending.size,0);f.instance.destroy();
});
test('reduced motion skips intro and switches without a frame loop',async()=>{
 for(const mode of [{reduced:true}]){const f=fixture(mode);f.show();await flush();assert.equal(f.root.dataset.intro,'skipped');await f.instance.go(7);assert.equal(f.root.dataset.page,'8');assert.equal(f.pending.size,0);f.instance.destroy();}
});
test('data saving skips automatic riffle and manual animations',async()=>{
 const f=fixture({saveData:true});f.show();await flush();assert.equal(f.root.dataset.intro,'skipped');await f.instance.go(1);assert.equal(f.pending.size,0);f.doc.hidden=true;f.doc.fire('visibilitychange');assert.equal(f.pending.size,0);assert.equal(f.root.dataset.page,'2');f.instance.destroy();
});
test('eight local illustrations, compact markup, no old guidance or credit',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8').split('<section id="field-notes"')[1].split('</section>')[0];
 assert.equal((html.match(/<option /g)||[]).length,8);assert.doesNotMatch(html,/fn-reading|fn-credit|Original educational|September 2026|<article/);
 for(const [name] of plates){const file=new URL(`../assets/sketchbook/${name}.webp`,import.meta.url);assert.ok(existsSync(file));assert.ok(statSync(file).size<650000);}
});

test('mobile riffles back to the first spread and animates navigation',async()=>{
 const f=fixture({coarse:true});f.show();await flush();assert.equal(f.root.dataset.intro,'playing');
 assert.ok(f.frames()<500);assert.equal(f.root.dataset.page,'1');assert.equal(f.root.dataset.intro,'complete');
 await f.instance.go(2);assert.equal(f.root.dataset.state,'turning');assert.ok(f.pending.size>0);
 assert.ok(f.frames()<500);assert.equal(f.root.dataset.page,'3');assert.equal(f.pending.size,0);f.instance.destroy();
});

test('intro waits until most of the book is visible and retries after interrupted loading',async()=>{
 const f=fixture({coarse:true});f.show(.2);await flush();assert.notEqual(f.root.dataset.intro,'playing');
 f.show();f.hide();await flush();f.show();await flush();assert.equal(f.root.dataset.intro,'playing');
 f.frames();assert.equal(f.root.dataset.page,'1');assert.equal(f.root.dataset.intro,'complete');f.instance.destroy();
});
test('mobile opening riffle retries when scrolling interrupted it',async()=>{
 const f=fixture({coarse:true});f.show();await flush();f.frames(8);f.hide();
 assert.equal(f.root.dataset.intro,'pending');f.show();await flush();assert.equal(f.root.dataset.intro,'playing');
 f.frames();assert.equal(f.root.dataset.page,'1');assert.equal(f.root.dataset.intro,'complete');f.instance.destroy();
});

test('phone artwork variants stay within a lightweight transfer budget',()=>{
 let bytes=0;
 for(const [name] of plates){const file=new URL(`../assets/sketchbook/${name}-small.webp`,import.meta.url);assert.ok(existsSync(file));bytes+=statSync(file).size;}
 assert.ok(bytes<850000);
});
