import { profile, MEDIA_CONFIG, canvasDPR } from './device-profile.mjs';

export class VideoManager {
  constructor(videos, manifest = {}, deviceProfile = profile) {
    this.videos = [...videos]; this.manifest = manifest; this.zone = new Set(); this.active = new Set();
    this.profile = deviceProfile; this.fallback = new WeakSet();
    this.suspended = document.hidden; this.maxObserved = 0;
    this.limit = this.profile.posterOnly ? 0 : Math.min(MEDIA_CONFIG.videoConcurrencyLimit, this.profile.videoConcurrencyLimit);
    this.observer = new IntersectionObserver(entries => {
      for (const entry of entries) entry.isIntersecting ? this.zone.add(entry.target) : this.zone.delete(entry.target);
      this.reconcile();
    }, { rootMargin: `${MEDIA_CONFIG.activationMargin}px 0px` });
    for (const video of this.videos) {
      const renditions = manifest[video.dataset.src];
      if (renditions?.poster) video.poster = renditions.poster;
      video.addEventListener('error', () => {
        if (this.active.has(video) && video.getAttribute('src') !== video.dataset.src) {
          // A missing adaptive asset may fall back to the original without taking another slot.
          this.fallback.add(video); video.src = video.dataset.src; video.load(); video.play().catch(() => {});
        }
      });
      this.observer.observe(video);
    }
    this.onScroll = () => this.reconcile();
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll, { passive: true });
  }
  select(video) {
    const variants = this.manifest[video.dataset.src];
    if (!variants || this.fallback.has(video)) return video.dataset.src;
    const rect = video.getBoundingClientRect(), dpr = canvasDPR();
    const tiers = this.profile.videoRendition === 'low' ? ['low', 'mid', 'high']
      : this.profile.videoRendition === 'mid' ? ['mid', 'high'] : ['high'];
    // Promote only when object-fit:cover would visibly upscale the selected rendition.
    for (const tier of tiers) {
      const rendition = variants[tier];
      if (rendition && (tier === 'high' || (rendition.width >= rect.width * dpr && rendition.height >= rect.height * dpr)))
        return rendition.src;
    }
    return video.dataset.src;
  }
  teardown(video) {
    video.pause(); video.removeAttribute('src');
    for (const source of video.querySelectorAll('source')) source.removeAttribute('src');
    video.load(); this.active.delete(video);
    // removeAttribute avoids src="" accidentally fetching the document URL.
  }
  reconcile() {
    const candidates = this.suspended ? [] : [...this.zone].map(video => {
      const r = video.getBoundingClientRect();
      const visible = Math.max(0, Math.min(innerHeight, r.bottom) - Math.max(0, r.top));
      const distance = Math.max(0, r.top - innerHeight, -r.bottom);
      return { video, visible, distance };
    }).filter(v => v.distance <= MEDIA_CONFIG.activationMargin)
      .sort((a, b) => b.visible - a.visible || a.distance - b.distance);
    const selected = new Set(candidates.slice(0, this.limit).map(v => v.video));
    // Release all outgoing decoder sessions BEFORE assigning any incoming source.
    for (const video of this.active) if (!selected.has(video) || video.getAttribute('src') !== this.select(video)) this.teardown(video);
    for (const video of selected) if (!this.active.has(video)) {
      this.active.add(video); video.src = this.select(video); video.load(); video.play().catch(() => {});
    }
    this.maxObserved = Math.max(this.maxObserved, this.active.size);
  }
  suspend(value) { this.suspended = value; this.reconcile(); }
  get stats() { return { active: this.active.size, limit: this.limit, maxObserved: this.maxObserved,
    sources: this.videos.filter(v => v.getAttribute('src')).length }; }
}
