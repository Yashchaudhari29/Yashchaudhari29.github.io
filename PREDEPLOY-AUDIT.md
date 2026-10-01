# Pre-deployment audit — 30 September 2026

## Decision

Automated checks pass. Visual, touch and throttled-network verification remain outstanding; this is not a complete penetration test or a guarantee of rendering performance.

## Verified

- All 28 repository tests pass, covering media lifecycle, frame-cache bounds, constrained-device video suppression, sketchbook navigation and intro retries, preview-server access restrictions, metadata and CSP invariants.
- npm audit completed successfully: zero reported vulnerabilities across 77 dependency packages. This checks registry advisories, not every possible weakness or manually vendored script independently.
- HTML references: no missing local assets, broken fragment destinations or duplicate IDs. All image elements have an alt attribute; all new-tab links include noopener. One H1 is present.
- All 18 unique external anchor URLs were requested: 17 returned HTTP 200; the LinkedIn profile returned 999. The detailed JSON was removed during the requested cleanup; this report retains the results. HTTP 200 confirms availability, not correct content, public document permissions, login flows or complete app functionality.
- CV and certificate download targets exist locally. Certificate identity and current CV contents still need owner review.
- Current public homepage returns HTTP 200 over HTTPS and sends Strict-Transport-Security.
- No obvious eval, document.write or HTML-injection sinks were found in the first-party .mjs files searched. No conventional .env, PEM, key or credential filenames were found in the workspace scan outside node_modules. Neither check is a full secret/history or data-flow audit.

## Fixed during this audit

- Closed mobile menu is inert and hidden from assistive technology; the toggle exposes its expanded state and controlled panel. Escape closes the menu and restores focus to its button.
- Reduced-motion users skip the visual intro and reveal transitions and receive immediate anchor scrolling.

## Before release

1. Manually open the LinkedIn profile and Google Drive certificate links in a signed-out browser. Confirm the certificates belong to the intended entries and are publicly viewable.
2. Visually check 320/390px phones, a 768px tablet and desktop. Check navigation, contact controls, footer spacing, gallery selector truncation and horizontal overflow. Browser automation currently fails with a local runtime asset-path error, so these checks could not be completed in this audit.
3. Test Android Chrome and iPhone Safari: scroll both directions, rotate the device, background/resume the tab, change gallery pages and use the back-to-top control. Verify the opening riffle ends on page one.
4. Run a cold-cache slow-network/CPU-throttled test. Confirm text and posters remain visible while assets load; record LCP, CLS and interaction responsiveness. No measured performance score is claimed here. Browser connection/device-memory hints are not available everywhere, so physical-device checks matter.
5. Configure and verify production response headers where the hosting platform supports them. The checked public homepage did not send CSP, X-Frame-Options, X-Content-Type-Options or Referrer-Policy headers. Local HTML contains a CSP and referrer meta policy, but this does not establish the deployed policy; frame-ancestors requires a response header. Preview-server protections do not automatically transfer to hosting. Do not add a misleading meta frame-ancestors directive.
6. Deploy the complete required asset set, including the new small WebP variants, CSS and JavaScript modules. The current public page may differ from the local changes. No deployment was performed.
7. After deployment, recheck asset responses, browser console/network errors, HTTPS, canonical URL, robots.txt, sitemap and CV download. Update sitemap lastmod to the actual publication date.

## Remaining tradeoffs

- Fonts, Bootstrap icons and the Skills image still depend on external services. Self-hosting can improve reliability; their presence is not itself evidence of a vulnerability.
- CSP allows inline styles for the existing design. Scripts remain restricted to self. Tightening style policy requires a deliberate styling migration.
- Full-size gallery art totals about 4 MB; phone variants total about 736 KB. Download and decoding cost still exists even with deferred loading and reduced-media fallbacks.
- A production header gap is a hardening task, not proof that the portfolio has been compromised.
