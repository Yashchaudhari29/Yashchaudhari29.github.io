// A bounded sliding ring. Pending fetch/decode reservations count against the limit.
export class FrameBuffer {
  constructor({ count, radius = 15, capacity = 31, url, decode, fetcher = (...args) => fetch(...args), onFrame = () => {} }) {
    Object.assign(this, { count, radius, capacity, url, decode, fetcher, onFrame });
    this.frames = new Map(); this.pending = new Map(); this.wanted = []; this.failed = new Set();
    this.generation = 0; this.decodes = 0; this.closed = 0; this.target = 0;
  }
  seek(index, direction = 1) {
    this.target = Math.max(0, Math.min(this.count - 1, index));
    const candidates = [this.target];
    for (let d = 1; d <= this.radius; d++) candidates.push(this.target + d * direction, this.target - d * direction);
    this.wanted = candidates.filter(i => i >= 0 && i < this.count).slice(0, this.capacity);
    const keep = new Set(this.wanted);
    for (const [i, bitmap] of this.frames) if (!keep.has(i)) { bitmap.close(); this.closed++; this.frames.delete(i); }
    for (const [i, job] of this.pending) if (!keep.has(i)) job.controller.abort();
    this.pump();
    return this.frames.get(this.target);
  }
  pump() {
    for (const i of this.wanted) {
      if (this.pending.size >= 2 || this.frames.size + this.pending.size >= this.capacity) break;
      if (this.frames.has(i) || this.pending.has(i) || this.failed.has(i)) continue;
      const job = { controller: new AbortController(), generation: this.generation };
      this.pending.set(i, job);
      this.load(i, job);
    }
  }
  async load(i, job) {
    let bitmap;
    try {
      const response = await this.fetcher(this.url(i), { signal: job.controller.signal });
      if (!response.ok) throw new Error(`Frame HTTP ${response.status}`);
      const blob = await response.blob();
      if (job.controller.signal.aborted) return;
      bitmap = await this.decode(blob); this.decodes++;
      if (job.generation !== this.generation || job.controller.signal.aborted || !this.wanted.includes(i)) {
        bitmap.close(); this.closed++; bitmap = null;
      } else {
        this.frames.set(i, bitmap); bitmap = null;
        this.onFrame(i);
      }
    } catch (error) {
      if (!job.controller.signal.aborted) { this.failed.add(i); console.warn('[hero] frame unavailable', i, error); }
    } finally {
      if (bitmap) { bitmap.close(); this.closed++; }
      this.pending.delete(i); this.pump();
    }
  }
  release() {
    this.generation++; this.wanted = []; this.failed.clear();
    for (const bitmap of this.frames.values()) { bitmap.close(); this.closed++; }
    this.frames.clear();
    // Do not clear pending reservations until non-cancellable decodes settle.
    for (const job of this.pending.values()) job.controller.abort();
  }
  get stats() { return { decoded: this.frames.size, pending: this.pending.size, capacity: this.capacity,
    decodedBytes: this.frames.size * (this.bytesPerFrame || 0), decodes: this.decodes, closed: this.closed }; }
}
