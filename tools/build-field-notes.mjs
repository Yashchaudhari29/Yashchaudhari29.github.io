// Rebuild only the gallery markup. Artwork is already local; no runtime build.
import { readFileSync, writeFileSync } from 'node:fs';
import { plates } from './sketchbook-plates.mjs';
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const html=`<section id="field-notes" aria-label="AI sketchbook gallery">
    <header class="fn-heading"><p>AI, imagined in ink</p><h2>Latent <em>Atlas</em></h2></header>
    <p id="fn-instructions" class="fn-sr">Use the arrow buttons or left and right keys to turn pages. Drag a page on desktop. The plate selector jumps to any illustration.</p>
    <svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs><filter id="fn-motion-blur"><feGaussianBlur stdDeviation="3 0"/></filter></defs></svg>
    <div class="fn-stage">
      <div class="fn-scene"><div class="fn-tilt"><div class="fn-book" role="group" aria-label="Illustrated AI sketchbook" aria-describedby="fn-instructions" tabindex="0">
        <div class="fn-full"><img src="/assets/sketchbook/attention-small.webp" srcset="/assets/sketchbook/attention-small.webp 768w, /assets/sketchbook/attention.webp 1536w" sizes="(max-width: 600px) calc(100vw - 32px), (max-width: 1080px) calc(100vw - 100px), 940px" alt="${esc(plates[0][2])}" width="1536" height="1024" loading="lazy" decoding="async"></div>
      </div></div></div>
      <div class="fn-zoom-layer" aria-hidden="true"><div class="fn-zoom-inner"></div></div>
      <div class="fn-loupe" aria-hidden="true"><span class="fn-handle"></span></div>
      <button class="fn-arrow" type="button" data-prev aria-label="Previous spread">‹</button>
      <button class="fn-arrow" type="button" data-next aria-label="Next spread">›</button>
    </div>
    <p class="fn-caption" aria-live="polite" aria-atomic="true">${plates[0][1]}</p>
    <div class="fn-toolbar" role="group" aria-label="Sketchbook controls">
      <button type="button" data-zoom-out aria-label="Zoom out">−</button>
      <span class="fn-zoom-read" data-zoom-read>100%</span>
      <button type="button" data-zoom-in aria-label="Zoom in">+</button>
      <span class="fn-divider" aria-hidden="true"></span>
      <button type="button" data-lens aria-label="Toggle magnifying glass" aria-pressed="true"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8" cy="8" r="5.5"/><path d="m12 12 5 5"/></svg></button>
      <span class="fn-divider" aria-hidden="true"></span>
      <select data-plates aria-label="Choose illustration">${plates.map(([name,title,alt],i)=>`<option value="${i}" data-image="/assets/sketchbook/${name}.webp" data-small="/assets/sketchbook/${name}-small.webp" data-alt="${esc(alt)}">${String(i+1).padStart(2,'0')} ${title}</option>`).join('')}</select>
    </div>
  </section>`;
const file=new URL('../index.html',import.meta.url);
const previous=readFileSync(file,'utf8');
if(!previous.includes('<section id="field-notes"'))throw new Error('Gallery insertion point missing');
writeFileSync(file,previous.replace(/<section id="field-notes"[\s\S]*?<\/section>/,html));
