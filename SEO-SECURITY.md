# SEO and security review — 2026-09-26

## Changes

- Responsive avatar card now uses two columns at every screen size: full-height photo left,
  centered content/CTA right. Expansion no longer changes the column geometry.
- Improved page title/description, added large-image indexing preference, social image alt text,
  site name/locale, and ProfilePage/Person JSON-LD using only the existing portfolio information.
- Retained canonical URL, crawlable HTML content, one H1, image alt text, robots.txt and sitemap.
  Added a main landmark, lazy decoding for the below-fold ONGC logo, and a visible role fallback.
  The no-JavaScript fallback now also removes the intro overlay, so content stays accessible.
- Moved executable inline JS into `script/page.mjs`; removed inline onclick handlers and
  document.write. The module still uses the existing shared media lifecycle implementation.
- Added a restrictive meta CSP: scripts and workers from self only; no eval/inline scripts;
  restricted styles/fonts, icon API connections and video origins; objects, base URLs and form
  submissions disallowed. Inline **styles** remain allowed for the existing design.
  The image policy also allows `https://images.higgs.ai`, which serves the original Skills
  CSS background. This narrowly scoped exception preserves that background without allowing
  images from every HTTPS host or changing the script policy.
- Hosted the exact previously used Typed.js 2.1.0 and Iconify 3.0.1 scripts locally, with MIT
  license notices. There is no third-party executable JavaScript request on page load. Google
  Fonts, Bootstrap Icons CSS/fonts and Iconify icon-data requests remain external and allowlisted.
- All external target=_blank links already had noopener noreferrer; regression checks preserve it.
- Preview binds only to loopback, serves only public folders/files, rejects private paths and
  symlink escapes, rejects writes/unexpected Host headers, and sends nosniff, anti-framing,
  referrer and permissions headers. These preview headers do NOT configure GitHub Pages.
- `_config.yml` excludes tooling, tests, build manifests and audit documents from GitHub
  Pages/Jekyll output. If a different publishing workflow bypasses Jekyll, configure equivalent
  exclusions in that workflow; this file is not an access-control mechanism.

## Verification and limits

- `npm test`: 12 tests passed, including JSON-LD/script-policy checks, external-link protections,
  and HTTP integration tests for private-path rejection, Host validation, methods and ranges.
- `npm run build:css`: passed. `npm audit --json`: zero reported advisories across the installed
  dependency tree (77 dependencies), including the exact Typed.js and Iconify versions now pinned
  in package.json/package-lock.json. Both local script files match their npm package files byte
  for byte (SHA-256 checked). Remote CSS/fonts/icon-data services are outside that audit.
  Iconify 3.0.1 is deprecated/unmaintained according to its npm notice: retain this as a maintenance
  item (replace with static SVGs or a maintained implementation), even with no current advisory.
  Pinning/local hosting and a clean audit do not prove a library bug-free.
- Focused source scan found no common private-key, AWS access-key, GitHub-token or Stripe live-key
  signatures. This was not a complete secret-history scan or penetration test.
- Browser checks cover phone, tablet and laptop geometry and console/CSP errors. Existing media
  performance release gates in MEDIA-PERFORMANCE.md still apply.

## Hosting items still outstanding

The public URL returned HTTP 200 with HSTS (`max-age=31556952`) during this review. Its inspected
response did not include CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy or
Permissions-Policy. It still serves the previously deployed build; these local changes have not
been published.

The meta CSP/referrer policy will ship with the HTML. **Framing protection cannot be implemented
using a CSP meta tag**. A host/CDN with response-header controls should additionally send:

```text
Content-Security-Policy: frame-ancestors 'none'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Retain the full HTML CSP (or move it to an equivalent response header) when adding these headers.
Do not add a `_headers` file expecting GitHub Pages to interpret it. Enforcing additional response
headers requires an appropriate hosting/CDN configuration; it has not been changed here.

For search visibility, publish the updated site, submit the existing sitemap in the owner's
Google Search Console property, inspect indexing and validate the ProfilePage markup with
Google's Rich Results Test. Search Console ownership/account access was not provided, so no
submission or indexing claim is made. Accurate project descriptions and useful public work
remain more valuable than keyword stuffing; metadata cannot guarantee rankings or audience size.

References: [Google ProfilePage guidance](https://developers.google.com/search/docs/appearance/structured-data/profile-page),
[Google structured data introduction](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data),
[MDN frame-ancestors and its meta-tag limitation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors).
