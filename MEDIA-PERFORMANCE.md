# Media lifecycle changes and verification

Implementation is ready for review. **Production sign-off remains pending** the real-device,
throttled trace, slow-network and memory-snapshot checks below. No deployment or CDN upload
has been performed.

## Phase 1 — hero

Files: `media.config.json`, `tools/build-media.mjs`, `frames/`, `script/frame-buffer.mjs`,
`script/hero.mjs`, `index.html`.

- Removed the hero video element and all client-side video seeking/frame extraction.
- Generated 181 desktop and 30 mobile WebP samples covering the original 10-second clip.
  Both sets retain 1920×1080 source detail. Mobile savings come from fewer samples and
  decoding only the centered crop actually rendered, at the capped display pixel density.
- Default requested sampling rates are 18 desktop / 12 mobile; desktop supports up to 30.
  The 30-frame mobile ceiling reduces the effective sampling rate to approximately 2.9 fps
  for this clip, spread over its entire duration rather than truncating its ending.
- The ring orders the current frame first, then alternates ahead/behind in scroll direction
  within ±15. A 64 MiB decoded-pixel budget further limits its maximum of 31 reservations.
  Two concurrent fetch/decode jobs count toward that maximum. Eviction explicitly closes
  bitmaps; late decodes after cancellation are also closed. Compressed browser caches and
  temporary decoder buffers are outside the decoded-pixel budget.
- The background is fixed across the whole page, so `#home` leaving view is intentionally
  NOT a release signal: it remains part of the visible design. Actual canvas exit, pagehide,
  hidden tabs and the diagnostic suspend action release its entire buffer. Pageshow resumes.
- Resize events are coalesced for 150 ms and preserve the displayed frame while rebuilding.

Verified: structural scan finds no seeking/extraction; unit tests cover bounds, reversals,
late completions, failures and complete release. Browser observed 11 live frames at the
desktop preview size, then zero frames with all 11 closed on suspension.
DevTools before/after heap/GPU memory comparison and scroll equivalence remain pending.

## Phase 2 — background videos

Files: `script/video-manager.mjs`, `media/`, `index.html`, shared media builder.

- The actual page has **seven background video elements using six unique MP4s**. All seven
  now use the manager, including the previously eager videos in the three skill cards.
- No background has an initial `src` or child `<source>`. All have matching frame posters,
  `muted`, `playsinline`, `disablePictureInPicture`, `disableRemotePlayback`, and `preload=none`.
- Default concurrency is 2; low tier is 1. A 200 px activation margin preloads upcoming media.
  Visible coverage takes priority. Outgoing sources are removed and `load()` is called BEFORE
  assigning incoming sources. Hidden tabs and pagehide release every source.
- High uses the original CloudFront asset unchanged. Six mid (720p), six low (480p) and six
  matching WebP posters were generated locally. Selection starts at the capability tier,
  promoting only when the element's cover geometry needs more physical pixels. This means
  a tall mobile section can still require high quality. Resizes re-evaluate rendition choice.
- A missing rendition falls back once to its original, without taking another decoder slot.
  HLS (optional Phase 2b) is not implemented.

Verified: mocked seven-video handoffs never exceeded two sources and suspension removed all.
Browser skills-section check observed exactly two source attributes, both videos readyState 4,
and a recorded peak of 2. Actual hardware decoder contention testing remains pending.

### Building and uploading

Requires Node.js and `ffmpeg`/`ffprobe` on PATH. No npm packages are needed for the media build.

```sh
npm run build:media -- --mode hero --hero-input /path/to/hero.mp4 --desktop-fps 18 --mobile-fps 12 --mobile-frames 30
npm run build:media -- --mode videos --source-dir /path/to/original-mp4s
```

Without input overrides the builder reads the current CloudFront URLs. Keep downloaded originals
outside the repository. `--output /path/to/staging` changes the output root. `--cdn-base
https://YOUR-DISTRIBUTION/YOUR-PREFIX` generates CDN asset URLs, retaining `/frames/` and `/media/`
subdirectories. Publish the resulting manifests at the site's `/frames/manifest.json` and
`/media/manifest.json`. The high rendition can continue using its original existing URL.

The checked-in manifests point to local generated assets so this checkout works immediately;
they do not pretend that new CDN URLs already exist. To use the existing CloudFront distribution,
upload `frames/` and `media/` to its S3 origin under the chosen prefix, then publish the matching
manifests. The origin bucket, credentials, distribution deployment and cache invalidation still
need to be supplied/configured. Serve cross-origin frames with an appropriate CORS header and
correct WebP/MP4 content types. Verify URLs before switching the manifests. Retain existing high
assets. Use versioned prefixes for future rebuilds to avoid stale asset/manifest combinations.

`maxRenderedWidth`, `maxRenderedHeight`, `maxDPR` and WebP quality live in `media.config.json`.
The full-screen cover calculation accounts for both dimensions and never upscales the source.
The current render envelope is 1920×1080 CSS pixels at up to 2× DPR; the source is already the
resolution ceiling. Larger/new source assets need this configuration revisited.

## Phase 3 — canvas scheduling

Files: `script/animation-driver.mjs`, `script/particles.mjs`, `script/particles-worker.mjs`,
`script/media-runtime.mjs`, and project callbacks in `script/page.mjs` (extracted from `index.html`
during the subsequent CSP/security review).

- One main-thread rAF driver handles hero and project callbacks. It cancels when no callbacks
  are active. IntersectionObserver controls registrations; hidden tabs suspend all callbacks.
- All backing resolutions use the shared DPR cap (2; low tier 1.5). ResizeObserver tracks project
  widths. Animation timing uses elapsed time, preserving speed when frame rate is capped.
- The full-screen 55-particle/connecting-line renderer runs on OffscreenCanvas in a module worker.
  Its independent worker clock cancels when inactive. It does not depend on main-thread tick
  messages. Unsupported or failed worker initialization falls back to the same renderer through
  the shared driver, replacing a transferred canvas before obtaining a main-thread context.
- The four project renderers keep DOM-side measurement/resize handling for now; comments identify
  this staged migration. Their visuals and content remain intact.

Verified: shared-driver cancellation/no-duplicate-loop unit test; browser worker ready signal;
**36 worker-rendered frames during a 600 ms synchronous main-thread block**. Suspension showed
both `canvasRAF: false` and `particleWorkerActive: false`.

## Phase 4 — device profile

File: `script/device-profile.mjs`. One immutable page-load capability snapshot is shared by all
three subsystems. Missing memory/CPU signals default to 4. Profiles follow the requested initial
memory/network/save-data thresholds. Network changes are logged; full mid-session tier migration
is intentionally deferred. DPR remains responsive to display changes. Tests cover defaults,
high-memory devices, 2G/3G, low memory and save-data.

**Values requiring real-device tuning:** memory thresholds 2/4 GiB; 24/30/60 fps caps; DPR 1.5/2;
video concurrency 1/2; activation margin 200 px; ±15 frame radius, 64 MiB decoded budget and two
in-flight jobs; 30 mobile samples; desktop sampling rate; rendition CRF 22/24 and WebP quality 95.
Do not treat these initial values as empirical Android sign-off.

## Phase 5 — repeatable checks

```sh
npm test
npm run preview
# Open http://127.0.0.1:4173/?media-debug
```

The opt-in diagnostic panel displays profile, active/peak video sources, live/pending/closed hero
bitmaps, decoded bytes, worker status and long-task maximum. It provides suspension/resumption,
timing reset and the explicit 600 ms worker stress test. The normal page does not poll diagnostics
or emit worker frame telemetry. `window.mediaDiagnostics()` is also available in DevTools.

Completed automated checks: cache lifecycle/races, source limits, profile thresholds, quality
promotion, driver cancellation, HTML structure and existence of every generated asset. Browser
checks are smoke tests, not a substitute for Chrome recordings or physical hardware.

An additional scroll smoke test recorded a 229 ms task before the stylesheet change. To remove
browser-side Tailwind compilation, the CDN compiler/config script was replaced with checked-in
`css/tailwind.css`, generated using the same theme in `tailwind.config.cjs` and Tailwind 3.4.17.
`css/tailwind-input.css`, `package.json`, `package-lock.json` and `.gitignore` support reproducible
builds. Run `npm ci` then `npm run build:css` after changing utility classes. This does not change
the theme or require build dependencies on the deployed static site.

Final in-app smoke checks: 390×844 mobile layout had no horizontal overflow and retained its
fixed navigation and cinematic hero. At a 1280×720 desktop viewport, a down-page scroll and
partial return recorded a 137 ms maximum long task after resetting the startup sample, no
console errors, a peak of two sourced videos and at most 18 cached frames (66,355,200 decoded
bytes, below 64 MiB). This is an unthrottled sample, not a dropped-frame trace or Android result.
The worker block test and release checks above passed. All 10 automated tests and the static CSS
build passed; `git diff --check` passed. The static CSS link follows the inline styles to preserve
the original CDN-injected utility cascade, including fixed navbar positioning.

Remaining release gates:

1. Chrome Performance: reset diagnostics AFTER startup, record a complete down/up scroll at
   4× and 6× CPU slowdown, inspect frames and tasks. Initial in-app load recorded a 267 ms task;
   no claim of zero tasks >200 ms is made. The deliberate worker test creates its own 600 ms
   task and must not be included in ordinary scroll performance results.
2. Chrome Memory: snapshot baseline, scroll down/up repeatedly, hide/show, then compare retained
   objects and browser/GPU memory. Since the background remains visible across the page, a bounded
   hero cache while scrolling is expected; hide/pagehide must bring live bitmaps to zero.
3. Mid-range Android/real-device lab: scroll all seven videos, test decoder contention, rotate,
   collapse/expand browser chrome, switch tabs and navigate back through BFCache.
4. Slow 3G + save-data: reload (profile is cached), verify mobile manifest selection, posters,
   navigation responsiveness and lower renditions where pixel geometry permits them. Verify
   frame/network failures retain a usable page without retry storms.
5. Desktop/high-end mobile: compare normal-scroll footage, text, canvas effects and original high
   video quality. Test portrait/landscape crop continuity and full-page hero progression.

Chrome was not connected in this session; the user selected the in-app browser for available
checks. No Android device, Chrome heap snapshot, CPU/network throttling trace or CDN upload is
claimed as completed.
